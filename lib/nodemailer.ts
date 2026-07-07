import nodemailer from "nodemailer";
import type { AIReview } from "./groq";

// ── HTML sanitizer ─────────────────────────────────────────────────────────
// Escapes HTML special characters to prevent injection in email templates.
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ── Transport ──────────────────────────────────────────────────────────────
// nodemailer.createTransport() sets up the email provider connection.
// We use Gmail here but you can swap host/port for any SMTP provider.
// App password: https://myaccount.google.com/apppasswords
// (Gmail requires an App Password, NOT your normal Gmail password)

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM!,       // your Gmail address
    pass: process.env.EMAIL_APP_PASSWORD!, // Gmail App Password (16 chars)
  },
});

// ── Types ──────────────────────────────────────────────────────────────────

interface SendReviewEmailParams {
  to: string;           // repo owner's email
  prNumber: number;
  prTitle: string;
  prUrl: string;
  prAuthor: string;
  repoFullName: string;
  review: AIReview;
}

// ── Severity styling for email ─────────────────────────────────────────────
// These are inline styles because most email clients strip <style> tags.

const SEVERITY_COLOR: Record<string, string> = {
  clean:    "#22c55e",
  low:      "#84cc16",
  medium:   "#f59e0b",
  high:     "#f97316",
  critical: "#ef4444",
};

const TYPE_LABEL: Record<string, string> = {
  security: "🔴 Security",
  perf:     "🟡 Performance",
  style:    "🔵 Style",
  logic:    "🟠 Logic",
};

// ── HTML email template ────────────────────────────────────────────────────
// Plain HTML with inline styles — works in Gmail, Outlook, Apple Mail.

function buildEmailHtml(params: SendReviewEmailParams): string {
  const { prNumber, prTitle, prUrl, prAuthor, repoFullName, review } = params;
  const severityColor = SEVERITY_COLOR[review.severity] ?? "#6b7280";

  // Build the issues list — only show if there are comments
  const issuesList =
    review.comments.length === 0
      ? `<p style="color:#6b7280;font-size:14px;">No issues found — clean PR!</p>`
      : review.comments
          .map(
            (c) => `
        <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:14px;margin-bottom:10px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="font-size:12px;font-weight:700;color:${severityColor};">
              ${TYPE_LABEL[c.type] ?? c.type}
            </span>
            <span style="font-size:11px;color:#4b5563;font-family:monospace;">
              ${escapeHtml(c.file)}:${c.line}
            </span>
          </div>
          <p style="color:#d1d5db;font-size:13px;margin:0 0 8px 0;line-height:1.5;">${escapeHtml(c.message)}</p>
          ${
            c.suggestion
              ? `<div style="background:#0d1117;border-radius:6px;padding:10px;border-left:3px solid #22c55e;">
                  <p style="color:#6b7280;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px 0;">Suggestion</p>
                  <pre style="color:#86efac;font-size:12px;margin:0;white-space:pre-wrap;font-family:monospace;">${escapeHtml(c.suggestion)}</pre>
                </div>`
              : ""
          }
        </div>`
          )
          .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="background:#000000;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">

    <!-- Header -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:32px;">
      <div style="background:linear-gradient(135deg,#22c55e,#06b6d4);width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;">
        <span style="color:#000;font-weight:900;font-size:14px;">PR</span>
      </div>
      <span style="font-size:16px;font-weight:700;color:#ffffff;">
        PRReview<span style="color:#22c55e;">.ai</span>
      </span>
    </div>

    <!-- PR Info -->
    <div style="background:#0f0f0f;border:1px solid #1f1f1f;border-radius:12px;padding:20px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <span style="font-family:monospace;font-size:11px;background:#1f1f1f;color:#6b7280;padding:2px 8px;border-radius:6px;">#${prNumber}</span>
        <span style="font-size:11px;font-weight:700;color:${severityColor};text-transform:uppercase;letter-spacing:0.1em;background:${severityColor}22;padding:2px 10px;border-radius:20px;border:1px solid ${severityColor}44;">
          ${review.severity}
        </span>
      </div>
      <h2 style="color:#ffffff;font-size:18px;font-weight:700;margin:0 0 8px 0;line-height:1.3;">${escapeHtml(prTitle)}</h2>
      <p style="color:#6b7280;font-size:13px;margin:0;">
        ${escapeHtml(repoFullName)} · opened by <strong style="color:#9ca3af;">${escapeHtml(prAuthor)}</strong>
      </p>
    </div>

    <!-- AI Summary -->
    <div style="background:#0f0f0f;border:1px solid #1f1f1f;border-radius:12px;padding:20px;margin-bottom:20px;">
      <p style="color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 10px 0;">AI Summary</p>
      <p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:0;">${escapeHtml(review.summary)}</p>
    </div>

    <!-- Issues -->
    <div style="background:#0f0f0f;border:1px solid #1f1f1f;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 14px 0;">
        Issues Found (${review.comments.length})
      </p>
      ${issuesList}
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${prUrl}" style="display:inline-block;background:#22c55e;color:#000000;font-weight:700;font-size:14px;padding:12px 28px;border-radius:100px;text-decoration:none;">
        View PR on GitHub →
      </a>
    </div>

    <!-- Footer -->
    <p style="color:#374151;font-size:12px;text-align:center;margin:0;">
      Sent by PRReview.ai · You're receiving this because you own ${escapeHtml(repoFullName)}
    </p>

  </div>
</body>
</html>`;
}

// ── Main export ────────────────────────────────────────────────────────────

export async function sendReviewEmail(
  params: SendReviewEmailParams
): Promise<void> {
  const { to, prNumber, prTitle, repoFullName, review } = params;

  const subject = `PR #${prNumber} reviewed — Title : ${prTitle} — ${
    review.comments.length > 0
      ? `${review.comments.length} issue${review.comments.length > 1 ? "s" : ""} found (${review.severity})`
      : "Clean PR ✓"
  } · ${repoFullName}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    html: buildEmailHtml(params),
  });
}