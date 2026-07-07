import { inngest } from "../client";
import { prisma } from "@/lib/prisma";
import { getOctokitForUser } from "@/lib/octokit";
import { generateReview } from "@/lib/groq";
import { sendReviewEmail } from "@/lib/nodemailer";

// ── The full PR review pipeline ────────────────────────────────────────────
//
// This function runs ASYNC after the webhook returns 200 to GitHub.
// Each step.run() is:
//   - Independently retried if it fails (other steps don't re-run)
//   - Logged individually in the Inngest dashboard
//   - Automatically retried up to 3 times with exponential backoff
//
// Flow:
//   1. Fetch PR diff from GitHub
//   2. Analyze with Groq AI
//   3. Post review comment on GitHub PR
//   4. Save review + comments to DB
//   5. Send summary email to repo owner
//   6. Create usage record + update webhook event status

export const reviewPR = inngest.createFunction(
  {
    id: "review-pr",
    name: "Review Pull Request",
    retries: 3,
    concurrency: { limit: 5 },
    triggers: [{ event: "pr/review.requested" }],
  },
  async ({ event, step }) => {
    const {
      webhookEventId,
      repoId,
      userId,
      owner,
      repo,
      prNumber,
      prTitle,
      prAuthor,
      prUrl,
      ownerEmail,
    } = event.data as {
      webhookEventId: string;
      repoId: string;
      userId: string;
      owner: string;
      repo: string;
      prNumber: number;
      prTitle: string;
      prAuthor: string;
      prUrl: string;
      ownerEmail: string;
    };

    // ── Step 1: Fetch PR diff from GitHub ──────────────────────────────────
    // step.run() wraps code in a retriable, logged step.
    // If this step succeeds, it won't re-run on retry — Inngest memoizes results.
    const { diff, prAuthorResolved } = await step.run(
      "fetch-pr-diff",
      async () => {
        const octokit = await getOctokitForUser(userId);

        // Fetch list of changed files — each file has a "patch" field with the diff
        const { data: files } = await octokit.pulls.listFiles({
          owner,
          repo,
          pull_number: prNumber,
          per_page: 100, // max 100 files per request
        });

        // Build the full diff string from all files
        // Filter out files with no patch (binary files, renamed-only files)
        const diff = files
          .filter((f) => f.patch)
          .map(
            (f) =>
              `--- ${f.filename} (${f.status}, +${f.additions} -${f.deletions})\n${f.patch}`,
          )
          .join("\n\n");

        if (!diff || diff.trim().length === 0) {
          throw new Error("Empty diff — no reviewable changes found");
        }

        return { diff, prAuthorResolved: prAuthor };
      },
    );

    // ── Step 2: Create pending Review record in DB ─────────────────────────
    // We create the record early so the dashboard shows "Reviewing..." status
    // while the AI is working.
    const review = await step.run("create-review-record", async () => {
      return await prisma.review.create({
        data: {
          repoId,
          prNumber,
          prTitle,
          prUrl,
          prAuthor: prAuthorResolved,
          severity: "clean", // will update after AI responds
          summary: "Analyzing...",
          status: "pending",
        },
      });
    });

    // ── Step 3: Generate AI review with Groq ──────────────────────────────
    // generateReview() sends the diff to Groq and returns structured JSON.
    // If Groq fails or returns invalid JSON, this step retries automatically.
    const aiReview = await step.run("generate-ai-review", async () => {
      return await generateReview(prTitle, prAuthorResolved, diff);
    });

    // ── Step 4: Post review comment on GitHub PR ─────────────────────────
    // If this fails (e.g. bad line numbers), we catch and continue —
    // the review is still saved to DB and email still sent.
    await step.run("post-github-comment", async () => {
      const octokit = await getOctokitForUser(userId);

      // Build the full review body as one markdown comment
      // No inline comments — avoids the diff line number mismatch issue
      const typeEmoji: Record<string, string> = {
        security: "🔴 Security",
        perf: "🟡 Performance",
        style: "🔵 Style",
        logic: "🟠 Logic",
      };

      const severityBadge: Record<string, string> = {
        clean: "✅ Clean",
        low: "🟢 Low",
        medium: "🟡 Medium",
        high: "🟠 High",
        critical: "🔴 Critical",
      };

      // Build issues section — only if there are comments
      const issuesSection =
        aiReview.comments.length === 0
          ? "_No issues found — clean PR!_"
          : aiReview.comments
            .map(
              (
                c: {
                  file: string;
                  line: number;
                  type: string;
                  message: string;
                  suggestion?: string | null;
                },
                i: number,
              ) => {
                let block = `### ${i + 1}. ${typeEmoji[c.type] ?? c.type} — \`${c.file}\` line ${c.line}\n\n`;
                block += `${c.message}\n`;
                if (c.suggestion) {
                  block += `\n**Suggested fix:**\n\`\`\`\n${c.suggestion}\n\`\`\``;
                }
                return block;
              },
            )
            .join("\n\n---\n\n");

      const body = `## PRReview.ai — ${severityBadge[aiReview.severity] ?? aiReview.severity} severity

${aiReview.summary}

---

## Issues Found (${aiReview.comments.length})

${issuesSection}

---

*Reviewed by [PRReview.ai](${process.env.NEXT_PUBLIC_APP_URL})*`;

      // Post as a single PR comment — never fails due to line number issues
      try {
        await octokit.issues.createComment({
          owner,
          repo,
          issue_number: prNumber, // GitHub treats PRs as issues for comments
          body,
        });
      } catch (err) {
        console.error("[Inngest] Failed to post GitHub comment:", err);
        // Don't throw — comment failure shouldn't fail the whole review
      }
    });

    // ── Step 5: Save review + comments to DB ──────────────────────────────
    // Update the Review record from "pending" to "completed"
    // and save all individual ReviewComment records.
    await step.run("save-to-db", async () => {
      // Update the Review record with AI results
      await prisma.review.update({
        where: { id: review.id },
        data: {
          severity: aiReview.severity,
          summary: aiReview.summary,
          status: "completed",
        },
      });

      // Save each individual comment
      // createMany is more efficient than multiple create() calls
      if (aiReview.comments.length > 0) {
        interface ReviewCommentData {
          reviewId: string;
          file: string;
          line: number;
          type: string;
          message: string;
          suggestion: string | null;
        }

        await prisma.reviewComment.createMany({
          data: aiReview.comments.map(
            (c: {
              file: string;
              line: number;
              type: string;
              message: string;
              suggestion?: string;
            }): ReviewCommentData => ({
              reviewId: review.id,
              file: c.file,
              line: c.line,
              type: c.type,
              message: c.message,
              suggestion: c.suggestion ?? null,
            }),
          ),
        });
      }
    });

    // ── Step 6: Send summary email ─────────────────────────────────────────
    // Only send if we have an email address to send to.
    await step.run("send-email", async () => {
      if (!ownerEmail) {
        console.log("[Inngest] No owner email — skipping email step");
        return;
      }

      await sendReviewEmail({
        to: ownerEmail,
        prNumber,
        prTitle,
        prUrl,
        prAuthor: prAuthorResolved,
        repoFullName: `${owner}/${repo}`,
        review: aiReview,
      });

      // Mark email as sent on the Review record
      await prisma.review.update({
        where: { id: review.id },
        data: {
          emailSent: true,
          emailSentAt: new Date(),
        },
      });
    });

    // ── Step 7: Record usage + finalize webhook event ──────────────────────
    await step.run("record-usage", async () => {
      // Create a UsageRecord — this is what the billing system counts
      await prisma.usageRecord.create({
        data: {
          userId,
          repoId,
          reviewId: review.id,
        },
      });

      // Mark the WebhookEvent as processed
      await prisma.webhookEvent.update({
        where: { id: webhookEventId },
        data: { status: "processed" },
      });
    });

    // Return a summary — visible in the Inngest dashboard
    return {
      reviewId: review.id,
      severity: aiReview.severity,
      comments: aiReview.comments.length,
      emailSent: !!ownerEmail,
    };
  },
);
