import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

// Free-tier TPM limits (per model): scout=30k, 70b=12k, 8b=6k
const DEFAULT_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const MODEL = process.env.GROQ_MODEL ?? DEFAULT_MODEL;

// ~4 chars/token — keep input small enough for free-tier TPM caps
const MAX_DIFF_CHARS = Number(process.env.GROQ_MAX_DIFF_CHARS ?? 18_000);
const MAX_DIFF_LINES = Number(process.env.GROQ_MAX_DIFF_LINES ?? 400);

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
  return `Review this PR diff. Return ONLY raw JSON (no markdown).

PR: ${prTitle} by ${prAuthor}

Diff:
${diff}

JSON shape:
{"summary":"2-3 sentences","severity":"clean|low|medium|high|critical","comments":[{"file":"path","line":42,"type":"security|perf|style|logic","message":"issue","suggestion":"fix"}]}

Rules: severity=clean if no issues (empty comments). Max 8 comments. Real issues only.`;
}

// ── Diff truncation ─────────────────────────────────────────────────────────

function truncateDiff(
  diff: string,
  maxLines = MAX_DIFF_LINES,
  maxChars = MAX_DIFF_CHARS,
): string {
  let result = diff;
  const lines = diff.split("\n");

  if (lines.length > maxLines) {
    result = lines.slice(0, maxLines).join("\n");
    result += `\n\n[Truncated: ${lines.length - maxLines} more lines not shown.]`;
  }

  if (result.length > maxChars) {
    result =
      result.slice(0, maxChars) +
      `\n\n[Truncated: diff exceeded ${maxChars} chars.]`;
  }

  return result;
}

// ── Main function ───────────────────────────────────────────────────────────

async function callGroq(prompt: string) {
  return groq.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    max_tokens: 1536,
    messages: [
      {
        role: "system",
        content: "Code review assistant. Respond with valid JSON only.",
      },
      { role: "user", content: prompt },
    ],
  });
}

export async function generateReview(
  prTitle: string,
  prAuthor: string,
  diff: string,
): Promise<AIReview> {
  // Try full truncation first; on 413 TPM limit, retry with half the diff
  const attempts = [
    { maxLines: MAX_DIFF_LINES, maxChars: MAX_DIFF_CHARS },
    {
      maxLines: Math.floor(MAX_DIFF_LINES / 2),
      maxChars: Math.floor(MAX_DIFF_CHARS / 2),
    },
  ];

  let response: Awaited<ReturnType<typeof callGroq>> | undefined;
  let lastError: unknown;

  for (const { maxLines, maxChars } of attempts) {
    const prompt = buildPrompt(
      prTitle,
      prAuthor,
      truncateDiff(diff, maxLines, maxChars),
    );

    try {
      response = await callGroq(prompt);
      break;
    } catch (err: unknown) {
      lastError = err;
      const status =
        err && typeof err === "object" && "status" in err
          ? (err as { status: number }).status
          : 0;
      if (status !== 413) throw err;
    }
  }

  if (!response) {
    throw lastError ?? new Error("Groq request failed after retries");
  }

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
