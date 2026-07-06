import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getOctokitForUser } from "@/lib/octokit";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ── Validation schemas ─────────────────────────────────────────────────────

const connectSchema = z.object({
  githubRepoId: z.number().int().positive(),
  name:         z.string().min(1).max(200),
  fullName:     z.string().min(3).max(400).regex(/^[^/]+\/[^/]+$/, "Must be owner/repo format"),
});

const disconnectSchema = z.object({
  repoId: z.coerce.number().int().positive(),
});

// ── POST /api/repos/connect ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Validate request body
    const body = await req.json();
    const parsed = connectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { githubRepoId, name, fullName } = parsed.data;

    const existing = await prisma.repo.findFirst({
      where: { userId: session.user.id, githubRepoId, isActive: true },
    });
    if (existing) {
      return NextResponse.json({ error: "Already connected" }, { status: 409 });
    }

    const octokit = await getOctokitForUser(session.user.id);
    const [owner, repo] = fullName.split("/");

    let webhookId: number | null = null;

    // ── Webhook creation ──────────────────────────────────────────────────
    // GitHub webhooks need a publicly accessible URL.
    // In local dev (localhost), we skip webhook creation and just save the repo.
    // Webhooks will be installed when you deploy with a real domain or use ngrok.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const isLocalDev = appUrl.includes("localhost") || appUrl.includes("127.0.0.1");

    if (!isLocalDev) {
      try {
        const { data: webhook } = await octokit.repos.createWebhook({
          owner,
          repo,
          config: {
            url: `${appUrl}/api/github/webhook`,
            content_type: "json",
            secret: process.env.GITHUB_WEBHOOK_SECRET!,
          },
          events: ["pull_request"],
          active: true,
        });
        webhookId = webhook.id;
      } catch (err: any) {
        if (err?.status === 422) {
          // 422 = webhook already exists or URL rejected
          const { data: existingHooks } = await octokit.repos.listWebhooks({
            owner,
            repo,
          });

          const found = existingHooks.find((h) =>
            h.config.url?.includes("/api/github/webhook")
          );

          if (found) {
            // Delete the old one and recreate with current URL
            await octokit.repos.deleteWebhook({
              owner,
              repo,
              hook_id: found.id,
            });

            // Now create fresh with correct URL
            const { data: newWebhook } = await octokit.repos.createWebhook({
              owner,
              repo,
              config: {
                url: `${appUrl}/api/github/webhook`,
                content_type: "json",
                secret: process.env.GITHUB_WEBHOOK_SECRET!,
              },
              events: ["pull_request"],
              active: true,
            });
            webhookId = newWebhook.id;
          } else {
            console.error("[/api/repos/connect] GitHub 422 error:", err?.response?.data ?? err?.message);
            return NextResponse.json(
              { error: "Failed to install webhook. Check repo admin permissions." },
              { status: 422 }
            );
          }
        } else {
          console.error("[/api/repos/connect] Webhook creation failed:", err?.response?.data ?? err?.message);
          return NextResponse.json(
            { error: "Webhook installation failed" },
            { status: 500 }
          );
        }
      }
    } else {
      console.log(`[/api/repos/connect] Local dev — skipping webhook for ${fullName}. Deploy with a public URL to enable webhooks.`);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    const savedRepo = await prisma.repo.upsert({
      where: { githubRepoId },
      create: {
        userId: session.user.id,
        githubRepoId,
        name,
        fullName,
        webhookId,
        ownerEmail: user?.email ?? null,
        isActive: true,
      },
      update: {
        name,
        fullName,
        webhookId,
        ownerEmail: user?.email ?? null,
        isActive: true,
      },
    });

    return NextResponse.json({ repo: savedRepo }, { status: 201 });

  } catch (error) {
    console.error("[/api/repos/connect POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── DELETE /api/repos/connect ──────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Validate request body
    const body = await req.json();
    const parsed = disconnectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { repoId } = parsed.data;

    const repoRecord = await prisma.repo.findFirst({
      where: { githubRepoId: repoId, userId: session.user.id, isActive: true },
    });
    if (!repoRecord) {
      return NextResponse.json({ error: "Repo not found" }, { status: 404 });
    }

    const octokit = await getOctokitForUser(session.user.id);
    const [owner, repo] = repoRecord.fullName.split("/");

    if (repoRecord.webhookId) {
      try {
        await octokit.repos.deleteWebhook({
          owner,
          repo,
          hook_id: repoRecord.webhookId,
        });
      } catch {
        console.warn(`Webhook ${repoRecord.webhookId} already removed`);
      }
    }

    await prisma.repo.update({
      where: { id: repoRecord.id },
      data: { isActive: false, webhookId: null },
    });

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("[/api/repos/connect DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}