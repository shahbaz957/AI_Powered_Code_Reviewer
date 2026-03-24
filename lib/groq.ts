import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

// ── Types ──────────────────────────────────────────────────────────────────

export interface ReviewComment {
  file: string;
  line: number;
  type: "security" | "perf" | "style" | "logic";
  message: string;
  suggestion?: string;
}

export interface AIReview {
  summary: string;
  severity: "clean" | "low" | "medium" | "high" | "critical";
  comments: ReviewComment[];
}

// ── Prompt ─────────────────────────────────────────────────────────────────

function buildPrompt(prTitle: string, prAuthor: string, diff: string): string {
  return `You are a senior software engineer doing a code review.

PR Title: ${prTitle}
PR Author: ${prAuthor}

Diff:
${diff}

Analyze this diff and return ONLY a valid JSON object. No markdown, no explanation, no backticks. Just the raw JSON.

Use this exact structure:
{
  "summary": "2-3 sentences describing what the PR does and overall code quality",
  "severity": "clean|low|medium|high|critical",
  "comments": [
    {
      "file": "path/to/file.ts",
      "line": 42,
      "type": "security|perf|style|logic",
      "message": "Clear description of the issue",
      "suggestion": "How to fix it"
    }
  ]
}

Severity rules — pick exactly one:
- clean    → no issues found
- low      → only minor style or naming issues
- medium   → logic issues, no security risk
- high     → security vulnerability or major performance issue
- critical → SQL injection, exposed secrets, auth bypass, data leak

Comment type rules:
- security → vulnerabilities, exposed keys, injection risks
- perf     → unnecessary loops, unindexed queries, memory leaks
- style    → naming, formatting, dead code
- logic    → wrong conditions, missing edge cases, incorrect behavior

Only comment on real issues. If the code is clean return an empty comments array.
Max 10 comments. Focus on the most important ones.`;
}

// ── Diff truncation ─────────────────────────────────────────────────────────

function truncateDiff(diff: string, maxLines = 800): string {
  const lines = diff.split("\n");

  if (lines.length <= maxLines) return diff;

  const truncated = lines.slice(0, maxLines).join("\n");
  return (
    truncated +
    `\n\n[Diff truncated — ${lines.length - maxLines} lines not shown. Review covers the first ${maxLines} lines only.]`
  );
}

// ── Main function ───────────────────────────────────────────────────────────

export async function generateReview(
  prTitle: string,
  prAuthor: string,
  diff: string,
): Promise<AIReview> {
  const truncatedDiff = truncateDiff(diff);
  const prompt = buildPrompt(prTitle, prAuthor, truncatedDiff);

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.2, // low temp = consistent structured output
    max_tokens: 2048,
    messages: [
      {
        role: "system",
        content:
          "You are a code review assistant. You always respond with valid JSON only. Never include markdown formatting or explanation outside the JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "";

  // ── Parse response ────────────────────────────────────────────────────────

  let parsed: AIReview;

  try {
    // Strip any accidental markdown backticks just in case
    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Github JSON Parsing Fails");
  }

  // ── Validate shape ────────────────────────────────────────────────────────

  if (!parsed.summary || !parsed.severity || !Array.isArray(parsed.comments)) {
    throw new Error("Groq JSON structure parsing Fails");
  }

  return parsed;
}
