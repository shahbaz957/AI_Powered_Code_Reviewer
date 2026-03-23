"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, GitPullRequest, GitMerge, User, Clock, FileCode,
  ShieldAlert, Zap, AlertTriangle, Info, CheckCircle2,
  ChevronDown, ChevronRight, ExternalLink, Copy, Mail,
  Minus, Plus, MessageSquare
} from "lucide-react";

// ── Mock data ────────────────────────────────────────────────────────────────

const REVIEW = {
  id: "r1",
  prNumber: 251,
  prTitle: "feat: add Stripe checkout flow",
  prUrl: "https://github.com/islamkhan/pr-reviewer/pull/251",
  prAuthor: "alex_k",
  prAuthorAvatar: null,
  repo: "islamkhan/pr-reviewer",
  branch: "feat/stripe-checkout",
  baseBranch: "main",
  status: "completed",
  severity: "critical",
  summary: "This PR introduces Stripe payment integration but contains a critical SQL injection vulnerability in the order creation endpoint, an exposed API key in a configuration comment, and uses a deprecated Stripe API method. The overall code structure is good, but these security issues must be resolved before merging.",
  emailSent: true,
  emailSentAt: "2h ago",
  reviewTime: "24s",
  createdAt: "2025-03-24T10:30:00Z",
  comments: [
    {
      id: "c1",
      file: "app/api/orders/create.ts",
      line: 47,
      type: "security",
      message: "SQL injection vulnerability detected. User input is being interpolated directly into the query string without parameterization.",
      suggestion: "Use parameterized queries: `db.query('SELECT * FROM orders WHERE id = $1', [orderId])` instead of string interpolation.",
    },
    {
      id: "c2",
      file: "lib/stripe.ts",
      line: 12,
      type: "security",
      message: "Hardcoded API key found in comment. Even commented-out secrets can be extracted from git history and pose a security risk.",
      suggestion: "Remove the commented key entirely. Use environment variables: `process.env.STRIPE_SECRET_KEY`",
    },
    {
      id: "c3",
      file: "app/api/orders/create.ts",
      line: 89,
      type: "perf",
      message: "The Stripe charge API is deprecated. `stripe.charges.create()` should be replaced with Payment Intents for better reliability and 3D Secure support.",
      suggestion: "Use `stripe.paymentIntents.create({ amount, currency, payment_method })` instead.",
    },
    {
      id: "c4",
      file: "components/checkout/CheckoutForm.tsx",
      line: 23,
      type: "style",
      message: "The `useEffect` dependency array is missing `onSuccess`. This can cause stale closure bugs if the callback changes between renders.",
      suggestion: "Add `onSuccess` to the dependency array: `useEffect(() => { ... }, [amount, onSuccess])`",
    },
    {
      id: "c5",
      file: "components/checkout/CheckoutForm.tsx",
      line: 67,
      type: "logic",
      message: "Error state is not reset before each new submission attempt. If a user fixes their card and retries, the previous error message will persist momentarily.",
      suggestion: "Call `setError(null)` at the start of the submit handler before making the API call.",
    },
  ],
  diff: [
    {
      file: "app/api/orders/create.ts",
      additions: 34,
      deletions: 8,
      chunks: [
        {
          header: "@@ -44,10 +44,18 @@ export async function POST(req: Request) {",
          lines: [
            { type: "context", content: "  const body = await req.json()", lineNo: { old: 44, new: 44 } },
            { type: "context", content: "  const { orderId, amount } = body", lineNo: { old: 45, new: 45 } },
            { type: "context", content: "", lineNo: { old: 46, new: 46 } },
            { type: "removed", content: "  const order = await db.query(`SELECT * FROM orders WHERE id = ${orderId}`)", lineNo: { old: 47, new: null } },
            { type: "added",   content: "  // TODO: fix this later", lineNo: { old: null, new: 47 } },
            { type: "added",   content: "  const order = await db.query(`SELECT * FROM orders WHERE id = ${orderId}`)", lineNo: { old: null, new: 48 } },
            { type: "context", content: "  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })", lineNo: { old: 48, new: 49 } },
          ],
        },
        {
          header: "@@ -85,6 +93,12 @@ async function createCharge(amount: number) {",
          lines: [
            { type: "context", content: "  const stripe = new Stripe(process.env.STRIPE_KEY!)", lineNo: { old: 85, new: 93 } },
            { type: "context", content: "", lineNo: { old: 86, new: 94 } },
            { type: "added",   content: "  // sk_live_oldkey123abc — backup key", lineNo: { old: null, new: 95 } },
            { type: "added",   content: "  const charge = await stripe.charges.create({", lineNo: { old: null, new: 96 } },
            { type: "added",   content: "    amount: amount * 100,", lineNo: { old: null, new: 97 } },
            { type: "added",   content: "    currency: 'usd',", lineNo: { old: null, new: 98 } },
            { type: "added",   content: "    source: token,", lineNo: { old: null, new: 99 } },
            { type: "added",   content: "  })", lineNo: { old: null, new: 100 } },
          ],
        },
      ],
    },
    {
      file: "components/checkout/CheckoutForm.tsx",
      additions: 89,
      deletions: 0,
      chunks: [
        {
          header: "@@ -0,0 +1,15 @@",
          lines: [
            { type: "added", content: "'use client'", lineNo: { old: null, new: 1 } },
            { type: "added", content: "", lineNo: { old: null, new: 2 } },
            { type: "added", content: "import { useState, useEffect } from 'react'", lineNo: { old: null, new: 3 } },
            { type: "added", content: "import { loadStripe } from '@stripe/stripe-js'", lineNo: { old: null, new: 4 } },
            { type: "added", content: "", lineNo: { old: null, new: 5 } },
            { type: "added", content: "export function CheckoutForm({ amount, onSuccess }) {", lineNo: { old: null, new: 6 } },
            { type: "added", content: "  const [error, setError] = useState(null)", lineNo: { old: null, new: 7 } },
            { type: "added", content: "  const [loading, setLoading] = useState(false)", lineNo: { old: null, new: 8 } },
            { type: "added", content: "", lineNo: { old: null, new: 9 } },
            { type: "added", content: "  useEffect(() => {", lineNo: { old: null, new: 10 } },
            { type: "added", content: "    loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!)", lineNo: { old: null, new: 11 } },
            { type: "added", content: "  }, [amount])", lineNo: { old: null, new: 12 } },
          ],
        },
      ],
    },
  ],
};

const TYPE_CONFIG: Record<string, { icon: typeof ShieldAlert; color: string; bg: string; label: string }> = {
  security: { icon: ShieldAlert,    color: "text-red-400",    bg: "bg-red-400/10 border-red-400/20",    label: "Security" },
  perf:     { icon: Zap,            color: "text-amber-400",  bg: "bg-amber-400/10 border-amber-400/20", label: "Performance" },
  style:    { icon: Info,           color: "text-cyan-400",   bg: "bg-cyan-400/10 border-cyan-400/20",   label: "Style" },
  logic:    { icon: AlertTriangle,  color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20",label: "Logic" },
};

const SEVERITY_STYLE: Record<string, string> = {
  critical: "bg-red-400/10 text-red-300 border-red-400/20",
  high:     "bg-orange-400/10 text-orange-300 border-orange-400/20",
  medium:   "bg-amber-400/10 text-amber-300 border-amber-400/20",
  clean:    "bg-green-400/10 text-green-300 border-green-400/20",
};

// ── Components ───────────────────────────────────────────────────────────────

function DiffChunk({ chunk, fileComments }: { chunk: typeof REVIEW.diff[0]["chunks"][0]; fileComments: typeof REVIEW.comments }) {
  return (
    <div className="font-mono text-[11px] sm:text-[12px]">
      <div className="px-4 py-1.5 bg-cyan-400/5 text-cyan-400/50 border-y border-white/[0.04] text-[11px]">
        {chunk.header}
      </div>
      {chunk.lines.map((line, i) => {
        const comment = fileComments.find((c) => c.line === (line.lineNo.new ?? line.lineNo.old));
        const config = comment ? TYPE_CONFIG[comment.type] : null;
        return (
          <div key={i}>
            <div className={cn(
              "flex items-start group",
              line.type === "added"   && "bg-green-400/[0.06]",
              line.type === "removed" && "bg-red-400/[0.06]",
              line.type === "context" && "bg-transparent",
            )}>
              {/* Line numbers */}
              <div className="flex-shrink-0 w-12 sm:w-16 flex text-white/15 select-none border-r border-white/[0.04]">
                <span className="w-6 sm:w-8 text-right pr-1 py-1">{line.lineNo.old ?? ""}</span>
                <span className="w-6 sm:w-8 text-right pr-2 py-1">{line.lineNo.new ?? ""}</span>
              </div>
              {/* Change marker */}
              <span className={cn(
                "flex-shrink-0 w-5 text-center py-1 select-none",
                line.type === "added"   && "text-green-400",
                line.type === "removed" && "text-red-400",
                line.type === "context" && "text-white/10",
              )}>
                {line.type === "added" ? "+" : line.type === "removed" ? "−" : " "}
              </span>
              {/* Content */}
              <pre className={cn(
                "flex-1 py-1 pr-4 overflow-x-auto leading-relaxed whitespace-pre",
                line.type === "added"   && "text-green-300/90",
                line.type === "removed" && "text-red-300/90",
                line.type === "context" && "text-white/50",
              )}>{line.content}</pre>
              {/* Issue indicator */}
              {comment && config && (
                <div className={cn("flex-shrink-0 m-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold border flex items-center gap-1", config.bg, config.color)}>
                  <config.icon className="h-2.5 w-2.5" />
                  {config.label}
                </div>
              )}
            </div>
            {/* Inline comment */}
            {comment && config && (
              <div className={cn("mx-4 mb-1 mt-0.5 p-3 rounded-xl border text-[12px]", config.bg)}>
                <div className="flex items-start gap-2">
                  <config.icon className={cn("h-3.5 w-3.5 flex-shrink-0 mt-0.5", config.color)} />
                  <div>
                    <p className="text-white/80 leading-relaxed mb-2">{comment.message}</p>
                    {comment.suggestion && (
                      <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                        <p className="text-[10px] text-white/30 mb-1 font-semibold uppercase tracking-wider">Suggestion</p>
                        <pre className="text-[11px] text-green-300/80 whitespace-pre-wrap font-mono">{comment.suggestion}</pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DiffFile({ file }: { file: typeof REVIEW.diff[0] }) {
  const [expanded, setExpanded] = useState(true);
  const fileComments = REVIEW.comments.filter((c) => c.file === file.file);

  return (
    <div className="border border-white/8 rounded-2xl overflow-hidden mb-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.03] hover:bg-white/[0.05] transition-colors text-left"
      >
        <ChevronRight className={cn("h-4 w-4 text-white/30 transition-transform flex-shrink-0", expanded && "rotate-90")} />
        <FileCode className="h-4 w-4 text-white/30 flex-shrink-0" />
        <span className="font-mono text-[12px] sm:text-[13px] text-white/70 flex-1 truncate">{file.file}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {fileComments.length > 0 && (
            <span className="text-[10px] font-semibold bg-amber-400/15 text-amber-400 border border-amber-400/20 px-1.5 py-0.5 rounded-md">
              {fileComments.length} issue{fileComments.length > 1 ? "s" : ""}
            </span>
          )}
          <span className="text-[11px] text-green-400/70 font-mono">+{file.additions}</span>
          <span className="text-[11px] text-red-400/70 font-mono">-{file.deletions}</span>
        </div>
      </button>
      {expanded && (
        <div className="overflow-x-auto border-t border-white/6">
          {file.chunks.map((chunk, i) => (
            <DiffChunk key={i} chunk={chunk} fileComments={fileComments} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ReviewDetailPage() {
  const [activeTab, setActiveTab] = useState<"diff" | "issues" | "summary">("summary");
  const review = REVIEW;
  const sevStyle = SEVERITY_STYLE[review.severity] ?? SEVERITY_STYLE.medium;

  const issuesByType = {
    security: review.comments.filter((c) => c.type === "security"),
    perf:     review.comments.filter((c) => c.type === "perf"),
    style:    review.comments.filter((c) => c.type === "style"),
    logic:    review.comments.filter((c) => c.type === "logic"),
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="pt-24 pb-16 px-4 sm:px-6 max-w-[1080px] mx-auto">

        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] text-white/35 hover:text-white transition-colors mb-6 group">
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>

        {/* PR Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-400/10 border border-violet-400/20">
              <GitMerge className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-[11px] font-semibold text-violet-400">Open</span>
            </div>
            <span className="font-mono text-[12px] text-white/30 bg-white/5 px-2 py-0.5 rounded-md">#{review.prNumber}</span>
            <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize", sevStyle)}>
              {review.severity}
            </span>
          </div>

          <h1 className="text-[22px] sm:text-[28px] font-black text-white leading-tight mb-3 tracking-tight">
            {review.prTitle}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-[12px] text-white/35">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> {review.prAuthor}
            </span>
            <span className="text-white/15">·</span>
            <span className="flex items-center gap-1.5">
              <GitPullRequest className="h-3.5 w-3.5" />
              <span className="font-mono">{review.branch}</span>
              <span className="text-white/20">→</span>
              <span className="font-mono">{review.baseBranch}</span>
            </span>
            <span className="text-white/15">·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Reviewed in {review.reviewTime}
            </span>
            <span className="text-white/15">·</span>
            <a href={review.prUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-green-400/70 hover:text-green-400 transition-colors">
              View on GitHub <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Issue summary badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {Object.entries(issuesByType).map(([type, items]) => {
            const cfg = TYPE_CONFIG[type];
            return (
              <div key={type} className={cn("p-3 rounded-xl border flex items-center gap-2.5", cfg.bg)}>
                <cfg.icon className={cn("h-4 w-4 flex-shrink-0", cfg.color)} />
                <div>
                  <div className={cn("text-[15px] font-black", cfg.color)}>{items.length}</div>
                  <div className="text-[11px] text-white/30">{cfg.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Email sent badge */}
        {review.emailSent && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-400/5 border border-green-400/15 mb-6">
            <Mail className="h-4 w-4 text-green-400 flex-shrink-0" />
            <span className="text-[12px] text-green-400/70">
              Summary emailed to repo owner · <span className="text-green-400">{review.emailSentAt}</span>
            </span>
          </div>
        )}

        {/* Mac-style window */}
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-[rgba(8,8,12,0.96)] shadow-2xl shadow-black/60">
          {/* Title bar */}
          <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-white/6 bg-white/[0.015]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 text-center font-mono text-[11px] text-white/25">
              {review.repo} — PR #{review.prNumber}
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <button className="flex items-center gap-1 text-[11px] text-white/20 hover:text-white/50 transition-colors">
                <Copy className="h-3 w-3" /> Copy
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5 overflow-x-auto scrollbar-hide">
            {(["summary", "issues", "diff"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-medium transition-all duration-200 flex-shrink-0 capitalize flex items-center gap-1.5",
                  activeTab === tab ? "bg-white/8 text-white" : "text-white/35 hover:text-white/60 hover:bg-white/4"
                )}
              >
                {tab === "summary" && <MessageSquare className="h-3.5 w-3.5" />}
                {tab === "issues" && <AlertTriangle className="h-3.5 w-3.5" />}
                {tab === "diff" && <FileCode className="h-3.5 w-3.5" />}
                {tab}
                {tab === "issues" && (
                  <span className="bg-amber-400/20 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5">
                    {review.comments.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">

            {/* Summary tab */}
            {activeTab === "summary" && (
              <div>
                <div className="flex items-start gap-3 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-green-400/10 border border-green-400/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-white mb-1">AI Review Summary</h3>
                    <p className="text-[13px] text-white/50 leading-relaxed">{review.summary}</p>
                  </div>
                </div>

                <div className="border-t border-white/6 pt-5">
                  <h4 className="text-[12px] font-semibold text-white/30 uppercase tracking-wider mb-3">Issues found ({review.comments.length})</h4>
                  <div className="space-y-2">
                    {review.comments.map((c) => {
                      const cfg = TYPE_CONFIG[c.type];
                      return (
                        <div key={c.id} className={cn("flex items-start gap-3 p-3 rounded-xl border", cfg.bg)}>
                          <cfg.icon className={cn("h-4 w-4 flex-shrink-0 mt-0.5", cfg.color)} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <span className={cn("text-[10px] font-bold uppercase tracking-wider", cfg.color)}>{cfg.label}</span>
                              <span className="font-mono text-[10px] text-white/25 truncate">{c.file}:{c.line}</span>
                            </div>
                            <p className="text-[12px] text-white/65 leading-relaxed">{c.message}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Issues tab */}
            {activeTab === "issues" && (
              <div className="space-y-4">
                {Object.entries(issuesByType).filter(([, items]) => items.length > 0).map(([type, items]) => {
                  const cfg = TYPE_CONFIG[type];
                  return (
                    <div key={type}>
                      <div className="flex items-center gap-2 mb-2">
                        <cfg.icon className={cn("h-4 w-4", cfg.color)} />
                        <h3 className={cn("text-[13px] font-bold", cfg.color)}>{cfg.label} Issues ({items.length})</h3>
                      </div>
                      <div className="space-y-2">
                        {items.map((c) => (
                          <div key={c.id} className={cn("p-4 rounded-xl border", cfg.bg)}>
                            <div className="font-mono text-[11px] text-white/30 mb-2 flex items-center gap-1">
                              <FileCode className="h-3 w-3" /> {c.file}
                              <span className="text-white/15">:</span>
                              <span className={cfg.color}>L{c.line}</span>
                            </div>
                            <p className="text-[13px] text-white/75 leading-relaxed mb-3">{c.message}</p>
                            {c.suggestion && (
                              <div className="bg-black/30 rounded-lg p-3 border border-white/6">
                                <p className="text-[10px] text-white/25 mb-1.5 font-semibold uppercase tracking-wider flex items-center gap-1">
                                  <Zap className="h-2.5 w-2.5 text-green-400" /> Suggested fix
                                </p>
                                <pre className="text-[11px] sm:text-[12px] text-green-300/80 whitespace-pre-wrap font-mono leading-relaxed">{c.suggestion}</pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Diff tab */}
            {activeTab === "diff" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[13px] text-white/40">
                    {review.diff.length} file{review.diff.length > 1 ? "s" : ""} changed ·{" "}
                    <span className="text-green-400/70">+{review.diff.reduce((a, f) => a + f.additions, 0)}</span>
                    {" "}<span className="text-red-400/70">-{review.diff.reduce((a, f) => a + f.deletions, 0)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="flex items-center gap-1 text-green-400/60"><Plus className="h-3 w-3" /> Added</span>
                    <span className="flex items-center gap-1 text-red-400/60"><Minus className="h-3 w-3" /> Removed</span>
                  </div>
                </div>
                {review.diff.map((file, i) => (
                  <DiffFile key={i} file={file} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}