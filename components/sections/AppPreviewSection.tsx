"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useReveal } from "@/hooks/useReveal";

const TABS = ["Overview", "Reviews", "Settings", "Billing"];

const REVIEWS = [
  { num: "#251", title: "feat: add Stripe checkout",    author: "alex_k",  severity: "2 high",   severityColor: "bg-red-400/8 text-red-300 border-red-400/15",     time: "24s", status: "done" },
  { num: "#250", title: "refactor: auth middleware",    author: "sarah_m", severity: "1 medium", severityColor: "bg-amber-400/8 text-amber-300 border-amber-400/15", time: "31s", status: "done" },
  { num: "#249", title: "fix: rate limit edge case",   author: "tommy_r", severity: "Clean ✓",  severityColor: "bg-green-400/8 text-green-300 border-green-400/15",  time: "—",   status: "reviewing" },
  { num: "#248", title: "feat: inngest webhook setup", author: "priya_s", severity: "—",        severityColor: "",  time: "—",   status: "queued" },
];

const STATUS: Record<string, { label: string; className: string }> = {
  done:      { label: "● Done",      className: "bg-green-400/8 text-green-400 border border-green-400/15" },
  reviewing: { label: "◎ Reviewing", className: "bg-cyan-400/8 text-cyan-400 border border-cyan-400/15" },
  queued:    { label: "○ Queued",    className: "bg-white/5 text-white/40 border border-white/10" },
};

export function AppPreviewSection() {
  const { ref, visible } = useReveal(0.1);
  const [activeTab, setActiveTab] = useState(1);

  return (
    <section className="relative z-10 py-8 sm:py-10 px-4 sm:px-6 pb-20 sm:pb-28">
      <div className="max-w-[1000px] mx-auto">

        {/* Header */}
        <div ref={ref} className={cn("text-center mb-8 sm:mb-10 transition-all duration-700", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5")}>
          <div className="section-label justify-center">Dashboard</div>
          <h2 className="text-white mb-3">All your reviews, one place</h2>
          <p className="text-white/50 text-[15px] sm:text-[16px] max-w-[420px] mx-auto leading-relaxed">
            Track every PR review, see issues found, manage your repo and billing.
          </p>
        </div>

        {/* App window */}
        <div className={cn("relative transition-all duration-700 delay-150", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <div className="absolute inset-0 rounded-3xl bg-radial-center blur-2xl opacity-60 pointer-events-none" />
          <div className="relative rounded-2xl border border-white/10 overflow-hidden bg-[rgba(8,8,12,0.96)] shadow-2xl shadow-black/70">

            {/* Title bar */}
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-white/6 bg-white/[0.02]">
              <div className="flex gap-1.5 flex-shrink-0">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/70" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 text-center font-mono text-[10px] sm:text-[11px] text-white/25 truncate">PRReview.ai Dashboard</div>
              <div className="font-mono text-[10px] sm:text-[11px] text-white/20 hidden sm:block flex-shrink-0">acme-corp/backend</div>
            </div>

            {/* Tabs — horizontal scroll on mobile */}
            <div className="flex items-center gap-1 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-white/5 bg-black/20 overflow-x-auto scrollbar-hide">
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={cn(
                    "px-3 sm:px-4 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-medium transition-all duration-200 flex-shrink-0",
                    activeTab === i ? "bg-white/8 text-white" : "text-white/35 hover:text-white/60 hover:bg-white/4"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4 sm:p-7">
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5 sm:mb-7">
                <div>
                  <h3 className="text-white text-[16px] sm:text-[18px] font-bold mb-1">PR Reviews</h3>
                  <p className="text-[12px] sm:text-[13px] text-white/35">acme-corp/backend · 28 reviews this month</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="px-3 py-2 rounded-xl text-[12px] font-semibold text-white bg-white/6 border border-white/10 hover:bg-white/10 transition-colors">
                    Filter
                  </button>
                  <button className="px-3 py-2 rounded-xl text-[12px] font-semibold text-black bg-green-400 hover:bg-green-300 transition-colors shadow-lg shadow-green-500/20 whitespace-nowrap">
                    + Connect Repo
                  </button>
                </div>
              </div>

              {/* Table — horizontal scroll on mobile */}
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full border-collapse min-w-[500px]">
                  <thead>
                    <tr>
                      {["Pull Request", "Author", "Issues", "Time", "Status"].map((h) => (
                        <th key={h} className="text-left text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase text-white/20 pb-3 px-2 first:pl-0">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {REVIEWS.map((row) => {
                      const s = STATUS[row.status];
                      return (
                        <tr key={row.num} className="border-t border-white/[0.04]">
                          <td className="py-3 sm:py-3.5 px-2 pl-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] sm:text-[11px] bg-white/6 text-white/30 px-1.5 py-0.5 rounded-md flex-shrink-0">{row.num}</span>
                              <span className="text-[12px] sm:text-[13px] font-semibold text-white">{row.title}</span>
                            </div>
                          </td>
                          <td className="py-3 sm:py-3.5 px-2 text-[12px] sm:text-[13px] text-white/40">{row.author}</td>
                          <td className="py-3 sm:py-3.5 px-2">
                            {row.severity !== "—" ? (
                              <span className={cn("text-[10px] sm:text-[11px] font-semibold px-2 py-1 rounded-full border whitespace-nowrap", row.severityColor)}>
                                {row.severity}
                              </span>
                            ) : <span className="text-white/20">—</span>}
                          </td>
                          <td className="py-3 sm:py-3.5 px-2 font-mono text-[10px] sm:text-[11px] text-white/25">{row.time}</td>
                          <td className="py-3 sm:py-3.5 px-2">
                            <span className={cn("text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-1 rounded-full whitespace-nowrap", s.className)}>
                              {s.label}
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
        </div>
      </div>
    </section>
  );
}