"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  GitPullRequest, ChevronDown, Search, Github, Plus, Star,
  Lock, Globe, Zap, TrendingUp, Clock, CheckCircle2, AlertTriangle,
  XCircle, RefreshCw, ChevronRight
} from "lucide-react";

// ── Mock data (replace with real API calls) ──────────────────────────────────

const MOCK_USER = {
  name: "Islam Khan",
  login: "islamkhan",
  email: "islam@example.com",
  image: null,
  plan: "free" as const,
  usageThisMonth: 4,
  usageLimit: 10,
};

const MOCK_GITHUB_REPOS = [
  { id: 1, name: "pr-reviewer",    fullName: "islamkhan/pr-reviewer",    private: false, stars: 12, language: "TypeScript", updatedAt: "2h ago" },
  { id: 2, name: "portfolio",      fullName: "islamkhan/portfolio",      private: false, stars: 3,  language: "Next.js",    updatedAt: "1d ago" },
  { id: 3, name: "api-gateway",    fullName: "islamkhan/api-gateway",    private: true,  stars: 0,  language: "Go",         updatedAt: "3d ago" },
  { id: 4, name: "ml-experiments", fullName: "islamkhan/ml-experiments", private: true,  stars: 1,  language: "Python",     updatedAt: "1w ago" },
  { id: 5, name: "dotfiles",       fullName: "islamkhan/dotfiles",       private: false, stars: 8,  language: "Shell",      updatedAt: "2w ago" },
];

const MOCK_REVIEWS = [
  { id: "r1", prNumber: 251, prTitle: "feat: add Stripe checkout flow",      author: "alex_k",  repo: "islamkhan/pr-reviewer", severity: "critical", issues: 2, time: "24s", status: "completed",  createdAt: "2h ago"  },
  { id: "r2", prNumber: 250, prTitle: "refactor: auth middleware cleanup",   author: "sarah_m", repo: "islamkhan/pr-reviewer", severity: "medium",   issues: 1, time: "31s", status: "completed",  createdAt: "5h ago"  },
  { id: "r3", prNumber: 249, prTitle: "fix: rate limit edge case on /api",   author: "tommy_r", repo: "islamkhan/api-gateway", severity: "clean",    issues: 0, time: "—",   status: "reviewing",  createdAt: "8h ago"  },
  { id: "r4", prNumber: 248, prTitle: "feat: inngest webhook event setup",   author: "priya_s", repo: "islamkhan/api-gateway", severity: "—",        issues: 0, time: "—",   status: "queued",     createdAt: "12h ago" },
  { id: "r5", prNumber: 247, prTitle: "chore: update prisma schema v2",      author: "islamkhan", repo: "islamkhan/pr-reviewer", severity: "low",    issues: 1, time: "18s", status: "completed",  createdAt: "1d ago"  },
];

const STATS = [
  { label: "Reviews this month", value: "4", sub: "of 10 free", icon: GitPullRequest, color: "text-green-400", bg: "bg-green-400/10" },
  { label: "Issues detected",    value: "9", sub: "+3 security", icon: AlertTriangle,  color: "text-amber-400", bg: "bg-amber-400/10" },
  { label: "Avg review time",    value: "26s", sub: "median",    icon: Clock,          color: "text-cyan-400",  bg: "bg-cyan-400/10"  },
  { label: "Clean PRs",          value: "60%", sub: "pass rate", icon: CheckCircle2,   color: "text-violet-400",bg: "bg-violet-400/10"},
];

const SEVERITY_MAP: Record<string, { label: string; class: string }> = {
  critical: { label: "Critical",  class: "bg-red-400/10 text-red-300 border-red-400/20"        },
  high:     { label: "High",      class: "bg-orange-400/10 text-orange-300 border-orange-400/20"},
  medium:   { label: "1 medium",  class: "bg-amber-400/10 text-amber-300 border-amber-400/20"  },
  low:      { label: "Low",       class: "bg-yellow-400/10 text-yellow-300 border-yellow-400/20"},
  clean:    { label: "Clean ✓",   class: "bg-green-400/10 text-green-300 border-green-400/20"  },
  "—":      { label: "—",         class: ""                                                     },
};

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  completed: { label: "● Done",      class: "bg-green-400/8 text-green-400 border border-green-400/15"  },
  reviewing: { label: "◎ Reviewing", class: "bg-cyan-400/8 text-cyan-400 border border-cyan-400/15"     },
  queued:    { label: "○ Queued",    class: "bg-white/5 text-white/40 border border-white/10"            },
  failed:    { label: "✕ Failed",    class: "bg-red-400/8 text-red-400 border border-red-400/15"         },
};

// ── Connect Repo Dropdown ────────────────────────────────────────────────────

function ConnectRepoDropdown({ onConnect }: { onConnect: (repo: typeof MOCK_GITHUB_REPOS[0]) => void }) {
  const [open, setOpen]         = useState(false);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [connected, setConnected] = useState<number[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = MOCK_GITHUB_REPOS.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.language.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleConnect = (repo: typeof MOCK_GITHUB_REPOS[0]) => {
    if (connected.includes(repo.id)) return;
    setLoading(true);
    setTimeout(() => {
      setConnected((prev) => [...prev, repo.id]);
      onConnect(repo);
      setLoading(false);
    }, 1200);
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
        {/* Header */}
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
              className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/8 rounded-xl text-[13px] text-white placeholder-white/25 outline-none focus:border-green-400/30 focus:bg-white/8 transition-all"
            />
          </div>
        </div>

        {/* Repos list */}
        <div className="max-h-[280px] overflow-y-auto py-1.5">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-[13px] text-white/30">No repositories found</div>
          ) : filtered.map((repo) => {
            const isConnected = connected.includes(repo.id);
            return (
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
                      <span className="text-[11px] text-white/20">·</span>
                      <span className="text-[11px] text-white/25">{repo.updatedAt}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleConnect(repo)}
                  disabled={isConnected || loading}
                  className={cn(
                    "flex-shrink-0 ml-3 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200",
                    isConnected
                      ? "bg-green-400/15 text-green-400 border border-green-400/20 cursor-default"
                      : "bg-white/8 text-white/60 border border-white/10 hover:bg-white/14 hover:text-white"
                  )}
                >
                  {isConnected ? "Connected" : loading ? "…" : "Connect"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/6 bg-white/[0.01]">
          <p className="text-[11px] text-white/25">
            Connecting installs a webhook. We only read diffs and post comments.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard Page ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const user = MOCK_USER;
  const [reviews] = useState(MOCK_REVIEWS);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const usagePct = Math.round((user.usageThisMonth / user.usageLimit) * 100);

  return (
    <div className="min-h-screen bg-black">
      <div className="pt-28 pb-16 px-4 sm:px-6 max-w-[1080px] mx-auto">

        {/* ── Greeting ── */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-[13px] text-white/35 mb-1 font-mono">{greeting()},</p>
              <h1 className="text-[28px] sm:text-[36px] font-black text-white leading-tight tracking-tight">
                {user.name.split(" ")[0]}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
                  👋
                </span>
              </h1>
              <p className="text-white/40 text-[14px] mt-1.5">
                @{user.login} · Free plan ·{" "}
                <span className={cn(usagePct >= 80 ? "text-amber-400" : "text-white/40")}>
                  {user.usageThisMonth}/{user.usageLimit} reviews used
                </span>
              </p>
            </div>
            <ConnectRepoDropdown onConnect={(repo) => console.log("Connected:", repo)} />
          </div>

          {/* Usage bar */}
          <div className="mt-5 p-4 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center gap-4 max-w-[480px]">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-white/40 font-medium">Monthly usage</span>
                <span className="text-[12px] font-semibold text-white">{user.usageThisMonth} / {user.usageLimit}</span>
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
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/14 transition-colors">
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-3", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
              <div className="text-[22px] sm:text-[26px] font-black text-white leading-none mb-0.5">{stat.value}</div>
              <div className="text-[11px] text-white/35">{stat.label}</div>
              <div className="text-[10px] text-white/20 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Reviews table ── */}
        <div className="rounded-2xl bg-[rgba(8,8,12,0.6)] border border-white/8 overflow-hidden">
          {/* Title bar */}
          <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-white/6 bg-white/[0.015]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 text-center font-mono text-[11px] text-white/25">PRReview.ai Dashboard</div>
            <div className="font-mono text-[11px] text-white/20 hidden sm:block">islamkhan/pr-reviewer</div>
          </div>

          {/* Inner content */}
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h2 className="text-[18px] font-bold text-white">PR Reviews</h2>
                <p className="text-[13px] text-white/35 mt-0.5">All connected repos · {reviews.length} recent</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium text-white/50 bg-white/5 border border-white/8 hover:bg-white/10 hover:text-white transition-colors">
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full border-collapse min-w-[580px]">
                <thead>
                  <tr>
                    {["Pull Request", "Repo", "Author", "Issues", "Time", "Status"].map((h) => (
                      <th key={h} className="text-left text-[10px] font-semibold tracking-widest uppercase text-white/20 pb-3 px-2 first:pl-0">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((row) => {
                    const sev = SEVERITY_MAP[row.severity] ?? SEVERITY_MAP["—"];
                    const st  = STATUS_MAP[row.status];
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
                            {row.repo.split("/")[1]}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-[13px] text-white/40">{row.author}</td>
                        <td className="py-3.5 px-2">
                          {sev.label !== "—" ? (
                            <span className={cn("text-[11px] font-semibold px-2 py-1 rounded-full border whitespace-nowrap", sev.class)}>
                              {sev.label}
                            </span>
                          ) : <span className="text-white/20 text-[13px]">—</span>}
                        </td>
                        <td className="py-3.5 px-2 font-mono text-[11px] text-white/25">{row.time}</td>
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
          </div>
        </div>

        {/* Quick tip */}
        <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-400/5 border border-green-400/15">
          <Zap className="h-4 w-4 text-green-400 flex-shrink-0" />
          <p className="text-[12px] text-green-400/70">
            <span className="font-semibold text-green-400">Tip:</span> Open a PR on any connected repo and the review will appear here automatically within seconds.
          </p>
        </div>
      </div>
    </div>
  );
}