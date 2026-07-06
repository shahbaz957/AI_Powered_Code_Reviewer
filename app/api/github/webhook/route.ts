import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/inngest/client";

// POST /api/github/webhook
//
// This is the endpoint GitHub calls every time a PR is opened/updated
// on any repo your users have connected.
//
// CRITICAL RULES for webhook handlers:
// 1. Always return 200 — even if you reject the event internally.
//    GitHub will DISABLE your webhook if it gets too many non-200 responses.
// 2. Respond immediately — do NOT do heavy work here.
//    Just validate, log, and queue. The Inngest job does the real work.
// 3. Never trust the payload — always verify the HMAC signature first.

export async function POST(req: NextRequest) {
  // ── Step 1: Read raw body ────────────────────────────────────────────────
  // We need the raw bytes (not parsed JSON) to verify the HMAC signature.
  // If we parse JSON first, the signature check will fail because
  // JSON.stringify() may reorder keys differently.
  const rawBody = await req.text();

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.warn("[Webhook] Invalid JSON payload — ignoring");
    return NextResponse.json({ ok: true });
  }

  // ── Step 2: Verify HMAC signature ───────────────────────────────────────
  // GitHub signs every webhook with your GITHUB_WEBHOOK_SECRET.
  // The signature comes in the "x-hub-signature-256" header.
  // We recompute the signature ourselves and compare — if they don't match,
  // someone is sending fake webhook events to your endpoint.
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[Webhook] GITHUB_WEBHOOK_SECRET is not configured — cannot verify signatures");
    return NextResponse.json({ ok: true });
  }

  const signature = req.headers.get("x-hub-signature-256");

  if (!signature) {
    // No signature = definitely not from GitHub
    // Return 200 anyway so GitHub doesn't disable the webhook
    console.warn("[Webhook] Missing signature — ignoring");
    return NextResponse.json({ ok: true });
  }

  const expectedSignature =
    "sha256=" +
    crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

  // timingSafeEqual prevents timing attacks
  // (comparing strings char by char leaks info about how many chars match)
  const sigBuffer      = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  const isValid =
    sigBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(sigBuffer, expectedBuffer);

  if (!isValid) {
    console.warn("[Webhook] Invalid signature — ignoring");
    // STILL LOG TO DB so we can debug secret mismatches!
    await prisma.webhookEvent.create({
      data: {
        repoId: "unknown",
        prNumber: 0,
        action: "unknown",
        payload: rawBody,
        status: "failed",
        error: "invalid_signature",
      },
    });
    return NextResponse.json({ ok: true }); // still 200!
  }

  // ── Step 3: Check event type ─────────────────────────────────────────────
  // GitHub sends many event types. We only care about pull_request events
  // with action "opened" or "synchronize" (synchronize = new commit pushed to PR).
  const event  = req.headers.get("x-github-event");
  const action = payload.action;

  if (event !== "pull_request") {
    // Ping events, push events, etc. — just acknowledge
    return NextResponse.json({ ok: true });
  }

  if (action !== "opened" && action !== "synchronize") {
    // PR closed, labeled, assigned, etc. — we don't care
    return NextResponse.json({ ok: true });
  }

  // ── Step 4: Extract PR data from payload ─────────────────────────────────
  // GitHub's pull_request payload shape:
  // payload.repository.id   = GitHub's numeric repo ID
  // payload.pull_request.number = PR number
  // payload.pull_request.title  = PR title
  // payload.pull_request.html_url = link to PR on GitHub
  // payload.pull_request.user.login = GitHub username who opened it
  const githubRepoId = payload.repository?.id;
  const prNumber     = payload.pull_request?.number;
  const prTitle      = payload.pull_request?.title;
  const prUrl        = payload.pull_request?.html_url;
  const prAuthor     = payload.pull_request?.user?.login;

  // Validate required fields exist
  if (!githubRepoId || !prNumber || !prTitle || !prUrl || !prAuthor) {
    console.warn("[Webhook] Missing required fields in payload — ignoring");
    await prisma.webhookEvent.create({
      data: {
        repoId: "unknown",
        prNumber: prNumber || 0,
        action: action || "unknown",
        payload: rawBody,
        status: "failed",
        error: "missing_fields",
      },
    });
    return NextResponse.json({ ok: true });
  }

  // ── Step 5: Look up repo in your DB ──────────────────────────────────────
  // Match by GitHub's repo ID — this tells us WHICH user owns this repo
  // and gives us their userId, ownerEmail, etc.
  const repoRecord = await prisma.repo.findFirst({
    where: {
      githubRepoId,
      isActive: true,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          // fetch plan field if you add it to User model later
        },
      },
    },
  });

  if (!repoRecord) {
    // Repo not connected in our system — ignore
    console.warn(`[Webhook] Repo ${githubRepoId} not found in DB`);
    await prisma.webhookEvent.create({
      data: {
        repoId: `github_id_${githubRepoId}`,
        prNumber,
        action,
        payload: rawBody,
        status: "failed",
        error: "repo_not_found_in_db",
      },
    });
    return NextResponse.json({ ok: true });
  }

  // ── Step 6: Check usage limits ───────────────────────────────────────────
  // Count how many reviews this user has done this calendar month.
  // Free plan = 10 reviews/month.
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const usageThisMonth = await prisma.usageRecord.count({
    where: {
      userId: repoRecord.userId,
      createdAt: { gte: startOfMonth },
    },
  });

  // TODO: Replace hardcoded 10 with dynamic limit based on user.plan
  // e.g. plan === "pro" ? Infinity : plan === "team" ? Infinity : 10
  const FREE_LIMIT = 10;

  if (usageThisMonth >= FREE_LIMIT) {
    console.log(`[Webhook] User ${repoRecord.userId} hit usage limit — skipping review`);

    // Log the skipped event in DB so user can see it in dashboard
    await prisma.webhookEvent.create({
      data: {
        repoId:   repoRecord.id,
        prNumber,
        action,
        payload:  rawBody,
        status:   "skipped",
        error:    "usage_limit_reached",
      },
    });

    return NextResponse.json({ ok: true }); // still 200!
  }

  // ── Step 7: Log the webhook event in DB ──────────────────────────────────
  // We save every event so you can debug failed reviews from the dashboard.
  const webhookEvent = await prisma.webhookEvent.create({
    data: {
      repoId:   repoRecord.id,
      prNumber,
      action,
      payload:  rawBody,
      status:   "received", // will update to "processed" after Inngest completes
    },
  });

  // ── Step 8: Queue the Inngest job ────────────────────────────────────────
  // We pass everything the pipeline needs upfront — no extra DB queries in Inngest.
  // inngest.send() is non-blocking — returns immediately after queuing.
  await inngest.send({
    name: "pr/review.requested",
    data: {
      webhookEventId: webhookEvent.id,
      repoId:         repoRecord.id,
      userId:         repoRecord.userId,
      owner:          payload.repository.owner.login,
      repo:           payload.repository.name,
      prNumber,
      prTitle,
      prAuthor,
      prUrl,
      ownerEmail:     repoRecord.ownerEmail ?? repoRecord.user.email ?? "",
    },
  });

  // ── Step 9: Respond immediately ──────────────────────────────────────────
  // GitHub expects a response within 10 seconds.
  // We are already done here — Inngest runs everything else async.
  return NextResponse.json({ ok: true });
}