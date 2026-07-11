"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePolling } from "@/hooks/usePolling";
import { hasInProgressReviews } from "@/lib/review-status";
import {
  GitPullRequest, ChevronDown, Search, Github, Plus, Star,
  Lock, Globe, Zap, CheckCircle2, AlertTriangle,
  RefreshCw, ChevronRight,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────

interface GithubRepo {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  language: string;
  stars: number;
  updatedAt: string;
  connected: boolean;
}

interface Review {
  id: string;
  prNumber: number;
  prTitle: string;
  prUrl: string;
  prAuthor: string;
  severity: string;
  status: string;
  issueCount: number;
  createdAt: string;
  repo: { name: string; fullName: string };
}

interface UsageStats {
  usageThisMonth: number;
  usageLimit: number;
  plan: string;
  totalReviews: number;
  totalIssues: number;
  securityIssues: number;
  cleanRate: number;
  connectedRepos: number;
}

// ── Severity & Status maps ─────────────────────────────────────────────────

const SEVERITY_MAP: Record<string, { label: string; class: string }> = {
  critical: { label: "Critical",  class: "bg-red-400/10 text-red-300 border-red-400/20"          },
  high:     { label: "High",      class: "bg-orange-400/10 text-orange-300 border-orange-400/20"  },
  medium:   { label: "Medium",    class: "bg-amber-400/10 text-amber-300 border-amber-400/20"     },
  low:      { label: "Low",       class: "bg-yellow-400/10 text-yellow-300 border-yellow-400/20"  },
  clean:    { label: "Clean ✓",   class: "bg-green-400/10 text-green-300 border-green-400/20"     },
};

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  completed: { label: "● Done",      class: "bg-green-400/8 text-green-400 border border-green-400/15"  },
  reviewing: { label: "◎ Reviewing", class: "bg-cyan-400/8 text-cyan-400 border border-cyan-400/15"     },
  pending:   { label: "◎ Reviewing", class: "bg-cyan-400/8 text-cyan-400 border border-cyan-400/15"     },
  queued:    { label: "○ Queued",    class: "bg-white/5 text-white/40 border border-white/10"           },
  failed:    { label: "✕ Failed",    class: "bg-red-400/8 text-red-400 border border-red-400/15"        },
};

// ── Connect Repo Dropdown ──────────────────────────────────────────────────

function ConnectRepoDropdown({ onConnected }: { onConnected: () => void }) {
  const [open,      setOpen]      = useState(false);
  const [search,    setSearch]    = useState("");
  const [repos,     setRepos]     = useState<GithubRepo[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [connecting, setConnecting] = useState<number | null>(null);
  const [disconnecting, setDisconnecting] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch GitHub repos every time the dropdown opens — ensures fresh data
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/repos/available", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setRepos(data.repos ?? []))
      .catch((err) => console.error("Failed to fetch repos:", err))
      .finally(() => setLoading(false));
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = repos.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleConnect = async (repo: GithubRepo) => {
    if (repo.connected || connecting !== null) return;
    setConnecting(repo.id);
    try {
      const res = await fetch("/api/repos/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubRepoId: repo.id,
          name:         repo.name,
          fullName:     repo.fullName,
        }),
      });
      if (res.ok) {
        setRepos((prev) =>
          prev.map((r) => r.id === repo.id ? { ...r, connected: true } : r)
        );
        onConnected();
      } else {
        const data = await res.json();
        alert(`Failed to connect: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      console.error("Connect error:", err);
      alert("Failed to connect repository. Please check your connection.");
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (repo: GithubRepo) => {
    if (!repo.connected || disconnecting !== null) return;
    if (!confirm(`Disconnect "${repo.name}"? This removes the webhook from GitHub.`)) return;
    setDisconnecting(repo.id);
    try {
      const res = await fetch("/api/repos/connect", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId: repo.id.toString() }),
      });
      if (res.ok) {
        setRepos((prev) =>
          prev.map((r) => r.id === repo.id ? { ...r, connected: false } : r)
        );
        onConnected();
      } else {
        const data = await res.json();
        alert(`Failed to disconnect: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      console.error("Disconnect error:", err);
      alert("Failed to disconnect repository.");
    } finally {
      setDisconnecting(null);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-green-400 text-black hover:bg-green-300 transition-all duration-200 shadow-lg shadow-green-500/25"
      >
        <Plus className="h-4 w-4" />
        Connect Repo
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>

      <div className={cn(
        "absolute right-0 top-full mt-2 w-[340px] bg-[rgba(10,10,14,0.98)] border border-white/12 rounded-2xl shadow-2xl shadow-black/70 backdrop-blur-2xl z-50 overflow-hidden",
        "transition-all duration-200 origin-top-right",
        open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
      )}>
        <div className="px-4 pt-4 pb-3 border-b border-white/6">
          <div className="flex items-center gap-2 mb-3">
            <Github className="h-4 w-4 text-white/40" />
            <span className="text-[13px] font-semibold text-white">Your GitHub Repositories</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25" />
            <input
              type="text"
              placeholder="Search repos…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/8 rounded-xl text-[13px] text-white placeholder-white/25 outline-none focus:border-green-400/30 transition-all"
            />
          </div>
        </div>

        <div className="max-h-[280px] overflow-y-auto py-1.5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-4 w-4 text-white/30 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-[13px] text-white/30">
              No repositories found
            </div>
          ) : filtered.map((repo) => (
            <div key={repo.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-white/4 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                {repo.private
                  ? <Lock className="h-3.5 w-3.5 text-white/25 flex-shrink-0" />
                  : <Globe className="h-3.5 w-3.5 text-white/25 flex-shrink-0" />
                }
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-white truncate">{repo.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-white/30">{repo.language}</span>
                    <span className="text-[11px] text-white/20">·</span>
                    <span className="text-[11px] text-white/25 flex items-center gap-0.5">
                      <Star className="h-2.5 w-2.5" />{repo.stars}
                    </span>
                  </div>
                </div>
              </div>
              {repo.connected ? (
                <button
                  onClick={() => handleDisconnect(repo)}
                  disabled={disconnecting === repo.id}
                  className="flex-shrink-0 ml-3 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 bg-green-400/15 text-green-400 border border-green-400/20 hover:bg-red-400/15 hover:text-red-400 hover:border-red-400/20"
                >
                  {disconnecting === repo.id ? "…" : "Connected ✓"}
                </button>
              ) : (
                <button
                  onClick={() => handleConnect(repo)}
                  disabled={connecting === repo.id}
                  className={cn(
                    "flex-shrink-0 ml-3 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200",
                    connecting === repo.id
                    ? "bg-white/5 text-white/30 border border-white/8 cursor-wait"
                    : "bg-white/8 text-white/60 border border-white/10 hover:bg-white/14 hover:text-white"
                  )}
                >
                  {connecting === repo.id ? "…" : "Connect"}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-white/6 bg-white/[0.01]">
          <p className="text-[11px] text-white/25">
            Connecting installs a webhook. We only read diffs and post comments.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard Page ────────────────────────────────────────────────────

export default function DashboardPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchDashboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [reviewsRes, usageRes] = await Promise.all([
        fetch("/api/reviews", { cache: "no-store" }),
        fetch("/api/usage", { cache: "no-store" }),
      ]);

      if (!reviewsRes.ok) throw new Error(`/api/reviews failed: ${reviewsRes.status}`);
      if (!usageRes.ok) throw new Error(`/api/usage failed: ${usageRes.status}`);

      const [reviewsData, usageData] = await Promise.all([
        reviewsRes.json(),
        usageRes.json(),
      ]);

      if (!isMounted.current) return;

      setReviews(reviewsData.reviews ?? []);
      setStats(usageData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      if (!isMounted.current) return;
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard(false);
  }, [fetchDashboard, refreshKey]);

  const inProgress = hasInProgressReviews(reviews);

  usePolling(() => fetchDashboard(true), {
    enabled: !loading && inProgress,
    intervalMs: 4_000,
    pauseWhenHidden: true,
  });

  usePolling(() => fetchDashboard(true), {
    enabled: !loading && !inProgress,
    intervalMs: 30_000,
    pauseWhenHidden: true,
  });

  const usagePct = stats
    ? stats.usageLimit === -1
      ? 0
      : Math.min(
          100,
          Math.round((stats.usageThisMonth / stats.usageLimit) * 100),
        )
    : 0;

  const usageLabel =
    stats?.usageLimit === -1
      ? `${stats.usageThisMonth} reviews used this month`
      : `${stats?.usageThisMonth ?? 0}/${stats?.usageLimit ?? 10} reviews used this month`;

  const STATS_CARDS = stats
    ? [
        {
          label: "Reviews this month",
          value: String(stats.usageThisMonth),
          sub:
            stats.usageLimit === -1
              ? "unlimited plan"
              : `of ${stats.usageLimit} free`,
          icon: GitPullRequest,
          color: "text-green-400",
          bg: "bg-green-400/10",
        },
        {
          label: "Issues detected",
          value: String(stats.totalIssues),
          sub: `${stats.securityIssues} security`,
          icon: AlertTriangle,
          color: "text-amber-400",
          bg: "bg-amber-400/10",
        },
        {
          label: "Clean PRs",
          value: `${stats.cleanRate}%`,
          sub: "pass rate",
          icon: CheckCircle2,
          color: "text-violet-400",
          bg: "bg-violet-400/10",
        },
        {
          label: "Repos connected",
          value: String(stats.connectedRepos),
          sub: "active",
          icon: Github,
          color: "text-cyan-400",
          bg: "bg-cyan-400/10",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-black">
      <div className="pt-28 pb-16 px-4 sm:px-6 max-w-[1080px] mx-auto">

        {/* ── Greeting ── */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-[13px] text-white/35 mb-1 font-mono">Welcome back,</p>
              <h1 className="text-[28px] sm:text-[36px] font-black text-white leading-tight tracking-tight">
                Your Dashboard
              </h1>
              <p className="text-white/40 text-[14px] mt-1.5">
                {stats
                  ? `${stats.plan} plan · ${usageLabel}`
                  : "Loading…"}
              </p>
              {inProgress && (
                <p className="text-[12px] text-cyan-400/80 mt-1.5 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400/60 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                  </span>
                  Review in progress — updating every few seconds
                </p>
              )}
            </div>
            <ConnectRepoDropdown onConnected={() => setRefreshKey((k) => k + 1)} />
          </div>

          {/* Usage bar */}
          {stats && (
            <div className="mt-5 p-4 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center gap-4 max-w-[480px]">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-white/40 font-medium">Monthly usage</span>
                  <span className="text-[12px] font-semibold text-white">
                    {stats.usageLimit === -1
                      ? stats.usageThisMonth
                      : `${stats.usageThisMonth} / ${stats.usageLimit}`}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", usagePct >= 80 ? "bg-amber-400" : "bg-green-400")}
                    style={{ width: `${usagePct}%` }}
                  />
                </div>
              </div>
              {usagePct >= 70 && (
                <Link href="/pricing" className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-green-400 text-black hover:bg-green-300 transition-colors whitespace-nowrap">
                  Upgrade →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 animate-pulse h-28" />
              ))
            : STATS_CARDS.map((stat) => (
                <div key={stat.label} className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/14 transition-colors">
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-3", stat.bg)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                  <div className="text-[22px] sm:text-[26px] font-black text-white leading-none mb-0.5">{stat.value}</div>
                  <div className="text-[11px] text-white/35">{stat.label}</div>
                  <div className="text-[10px] text-white/20 mt-0.5">{stat.sub}</div>
                </div>
              ))
          }
        </div>

        {/* ── Reviews table ── */}
        <div className="rounded-2xl bg-[rgba(8,8,12,0.6)] border border-white/8 overflow-hidden">
          {/* Mac title bar */}
          <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-white/6 bg-white/[0.015]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 text-center font-mono text-[11px] text-white/25">
              PRReview.ai Dashboard
              {lastUpdated && (
                <span className="hidden sm:inline text-white/15">
                  {" "}
                  · updated{" "}
                  {lastUpdated.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              disabled={loading || refreshing}
              className="flex items-center gap-1 text-[11px] text-white/20 hover:text-white/50 transition-colors disabled:opacity-40"
            >
              <RefreshCw
                className={cn(
                  "h-3 w-3",
                  (loading || refreshing) && "animate-spin",
                )}
              />{" "}
              Refresh
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h2 className="text-[18px] font-bold text-white">PR Reviews</h2>
                <p className="text-[13px] text-white/35 mt-0.5">
                  All connected repos · {reviews.length} recent
                </p>
              </div>
            </div>

            {/* Empty state */}
            {!loading && reviews.length === 0 && (
              <div className="text-center py-12">
                <GitPullRequest className="h-10 w-10 text-white/10 mx-auto mb-3" />
                <p className="text-[14px] font-semibold text-white/30 mb-1">No reviews yet</p>
                <p className="text-[13px] text-white/20">
                  Connect a repo and open a PR to trigger your first review.
                </p>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse" />
                ))}
              </div>
            )}

            {/* Reviews table */}
            {!loading && reviews.length > 0 && (
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full border-collapse min-w-[580px]">
                  <thead>
                    <tr>
                      {["Pull Request", "Repo", "Author", "Issues", "Status"].map((h) => (
                        <th key={h} className="text-left text-[10px] font-semibold tracking-widest uppercase text-white/20 pb-3 px-2 first:pl-0">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((row) => {
                      const sev = SEVERITY_MAP[row.severity] ?? SEVERITY_MAP["clean"];
                      const st  = STATUS_MAP[row.status]    ?? STATUS_MAP["queued"];
                      return (
                        <tr key={row.id} className="border-t border-white/[0.05] group">
                          <td className="py-3.5 px-2 pl-0">
                            <Link href={`/dashboard/reviews/${row.id}`} className="flex items-center gap-2 group-hover:text-green-400 transition-colors">
                              <span className="font-mono text-[11px] bg-white/6 text-white/30 px-1.5 py-0.5 rounded-md flex-shrink-0">
                                #{row.prNumber}
                              </span>
                              <span className="text-[13px] font-semibold text-white group-hover:text-green-400 transition-colors truncate max-w-[200px]">
                                {row.prTitle}
                              </span>
                              <ChevronRight className="h-3.5 w-3.5 text-white/0 group-hover:text-green-400/60 transition-all flex-shrink-0" />
                            </Link>
                          </td>
                          <td className="py-3.5 px-2">
                            <span className="text-[11px] font-mono text-white/30 bg-white/4 px-2 py-0.5 rounded-md whitespace-nowrap">
                              {row.repo.name}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-[13px] text-white/40">{row.prAuthor}</td>
                          <td className="py-3.5 px-2">
                            {row.issueCount > 0 ? (
                              <span className={cn("text-[11px] font-semibold px-2 py-1 rounded-full border whitespace-nowrap", sev.class)}>
                                {row.issueCount} {row.severity}
                              </span>
                            ) : row.severity === "clean" ? (
                              <span className={cn("text-[11px] font-semibold px-2 py-1 rounded-full border", sev.class)}>
                                Clean ✓
                              </span>
                            ) : (
                              <span className="text-white/20 text-[13px]">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-2">
                            <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap", st.class)}>
                              {st.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick tip */}
        <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-400/5 border border-green-400/15">
          <Zap className="h-4 w-4 text-green-400 flex-shrink-0" />
          <p className="text-[12px] text-green-400/70">
            <span className="font-semibold text-green-400">Tip:</span> Open a PR on any connected repo — the AI review will appear here automatically within seconds.
          </p>
        </div>

      </div>
    </div>
  );
}