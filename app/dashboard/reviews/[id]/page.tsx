"use client";

import { useState, useEffect, use, useCallback, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePolling } from "@/hooks/usePolling";
import { isReviewInProgress } from "@/lib/review-status";
import {
  ArrowLeft, GitPullRequest, User, Clock, FileCode,
  ShieldAlert, Zap, AlertTriangle, Info, CheckCircle2,
  ExternalLink, Mail, MessageSquare, RefreshCw
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface ReviewComment {
  id:         string;
  file:       string;
  line:       number;
  type:       "security" | "perf" | "style" | "logic";
  message:    string;
  suggestion: string | null;
}

interface ReviewDetail {
  id:          string;
  prNumber:    number;
  prTitle:     string;
  prUrl:       string;
  prAuthor:    string;
  severity:    string;
  summary:     string;
  status:      string;
  emailSent:   boolean;
  emailSentAt: string | null;
  createdAt:   string;
  comments:    ReviewComment[];
  repo: {
    name:       string;
    fullName:   string;
  };
}

// ── Config maps ────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { icon: typeof ShieldAlert; color: string; bg: string; label: string }> = {
  security: { icon: ShieldAlert,   color: "text-red-400",    bg: "bg-red-400/10 border-red-400/20",     label: "Security"     },
  perf:     { icon: Zap,           color: "text-amber-400",  bg: "bg-amber-400/10 border-amber-400/20", label: "Performance"  },
  style:    { icon: Info,          color: "text-cyan-400",   bg: "bg-cyan-400/10 border-cyan-400/20",   label: "Style"        },
  logic:    { icon: AlertTriangle, color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20",label: "Logic"       },
};

const SEVERITY_STYLE: Record<string, string> = {
  critical: "bg-red-400/10 text-red-300 border-red-400/20",
  high:     "bg-orange-400/10 text-orange-300 border-orange-400/20",
  medium:   "bg-amber-400/10 text-amber-300 border-amber-400/20",
  low:      "bg-yellow-400/10 text-yellow-300 border-yellow-400/20",
  clean:    "bg-green-400/10 text-green-300 border-green-400/20",
};

// ── Page ──────────────────────────────────────────────────────────────────

export default function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 16: params is a Promise in client components — use React's use() to unwrap
  const { id } = use(params);

  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "issues">("summary");
  const [notFound, setNotFound] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchReview = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      try {
        const r = await fetch(`/api/reviews/${id}`, { cache: "no-store" });
        if (r.status === 404) {
          if (isMounted.current) setNotFound(true);
          return;
        }
        if (!r.ok) throw new Error(`Failed: ${r.status}`);
        const data = await r.json();
        if (isMounted.current) setReview(data.review);
      } catch (err) {
        console.error("Failed to fetch review:", err);
      } finally {
        if (!isMounted.current) return;
        if (!silent) setLoading(false);
        setRefreshing(false);
      }
    },
    [id],
  );

  useEffect(() => {
    void fetchReview(false);
  }, [fetchReview]);

  usePolling(() => fetchReview(true), {
    enabled: !!review && isReviewInProgress(review.status),
    intervalMs: 3_000,
    pauseWhenHidden: true,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <RefreshCw className="h-6 w-6 text-white/20 animate-spin" />
      </div>
    );
  }

  if (notFound || !review) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-3">
        <p className="text-white/40 text-[15px]">Review not found</p>
        <Link href="/dashboard" className="text-green-400 text-[13px] hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const sevStyle = SEVERITY_STYLE[review.severity] ?? SEVERITY_STYLE["clean"];

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
            <span className="font-mono text-[12px] text-white/30 bg-white/5 px-2 py-0.5 rounded-md">
              #{review.prNumber}
            </span>
            <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize", sevStyle)}>
              {review.severity}
            </span>
            <span className={cn(
              "text-[11px] font-semibold px-2.5 py-1 rounded-full",
              review.status === "completed"
                ? "bg-green-400/8 text-green-400 border border-green-400/15"
                : "bg-cyan-400/8 text-cyan-400 border border-cyan-400/15"
            )}>
              {review.status === "completed" ? "● Done" : "◎ Reviewing"}
              {refreshing && review.status !== "completed" && (
                <RefreshCw className="inline h-3 w-3 ml-1 animate-spin opacity-60" />
              )}
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
              <span className="font-mono">{review.repo.fullName}</span>
            </span>
            <span className="text-white/15">·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {new Date(review.createdAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
              })}
            </span>
            <span className="text-white/15">·</span>
            <a
              href={review.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-green-400/70 hover:text-green-400 transition-colors"
            >
              View on GitHub <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Issue type badges */}
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

        {/* Email sent banner */}
        {review.emailSent && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-400/5 border border-green-400/15 mb-6">
            <Mail className="h-4 w-4 text-green-400 flex-shrink-0" />
            <span className="text-[12px] text-green-400/70">
              Summary emailed to repo owner ·{" "}
              <span className="text-green-400">
                {review.emailSentAt
                  ? new Date(review.emailSentAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                  : "sent"
                }
              </span>
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
              {review.repo.fullName} — PR #{review.prNumber}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5 overflow-x-auto">
            {(["summary", "issues"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all flex-shrink-0 capitalize flex items-center gap-1.5",
                  activeTab === tab ? "bg-white/8 text-white" : "text-white/35 hover:text-white/60 hover:bg-white/4"
                )}
              >
                {tab === "summary"
                  ? <><MessageSquare className="h-3.5 w-3.5" /> Summary</>
                  : <><AlertTriangle className="h-3.5 w-3.5" /> Issues
                      <span className="bg-amber-400/20 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5">
                        {review.comments.length}
                      </span>
                    </>
                }
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">

            {/* Summary tab */}
            {activeTab === "summary" && (
              <div>
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-green-400/10 border border-green-400/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-white mb-2">AI Review Summary</h3>
                    <p className="text-[13px] text-white/55 leading-relaxed">{review.summary}</p>
                  </div>
                </div>

                {review.comments.length > 0 && (
                  <div className="border-t border-white/6 pt-5">
                    <h4 className="text-[12px] font-semibold text-white/30 uppercase tracking-wider mb-3">
                      All Issues ({review.comments.length})
                    </h4>
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
                )}
              </div>
            )}

            {/* Issues tab */}
            {activeTab === "issues" && (
              <div className="space-y-4">
                {review.comments.length === 0 ? (
                  <div className="text-center py-10">
                    <CheckCircle2 className="h-10 w-10 text-green-400/30 mx-auto mb-3" />
                    <p className="text-[14px] text-white/30">No issues found — clean PR!</p>
                  </div>
                ) : (
                  Object.entries(issuesByType)
                    .filter(([, items]) => items.length > 0)
                    .map(([type, items]) => {
                      const cfg = TYPE_CONFIG[type];
                      return (
                        <div key={type}>
                          <div className="flex items-center gap-2 mb-2">
                            <cfg.icon className={cn("h-4 w-4", cfg.color)} />
                            <h3 className={cn("text-[13px] font-bold", cfg.color)}>
                              {cfg.label} ({items.length})
                            </h3>
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
                                    <pre className="text-[11px] sm:text-[12px] text-green-300/80 whitespace-pre-wrap font-mono leading-relaxed">
                                      {c.suggestion}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}