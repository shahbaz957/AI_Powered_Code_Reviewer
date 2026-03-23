"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useReveal } from "@/hooks/useReveal";
import {
  Brain,
  Zap,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  GitPullRequest,
  GitBranch,
  Bot,
  MessageSquare,
} from "lucide-react";

const REVIEW_LINES = [
  { type: "success", file: "auth/middleware.ts", line: 42,  msg: "Rate limiting looks solid" },
  { type: "warning", file: "api/reviews.ts",     line: 118, msg: "Consider memoizing this query" },
  { type: "error",   file: "hooks/useAuth.ts",   line: 23,  msg: "Missing null check on user" },
  { type: "info",    file: "lib/prisma.ts",       line: 7,   msg: "Good singleton pattern" },
];

const LINE_STYLES = {
  success: { border: "border-l-green-400/50", bg: "bg-green-400/5", file: "text-green-300" },
  warning: { border: "border-l-amber-400/50", bg: "bg-amber-400/5", file: "text-amber-300" },
  error:   { border: "border-l-red-400/50",   bg: "bg-red-400/5",   file: "text-red-300"   },
  info:    { border: "border-l-cyan-400/50",  bg: "bg-cyan-400/5",  file: "text-cyan-300"  },
};

const LINE_ICONS = {
  success: <CheckCircle2 className="h-3 w-3 text-green-400 flex-shrink-0 mt-0.5" />,
  warning: <AlertTriangle className="h-3 w-3 text-amber-400 flex-shrink-0 mt-0.5" />,
  error:   <XCircle className="h-3 w-3 text-red-400 flex-shrink-0 mt-0.5" />,
  info:    <Info className="h-3 w-3 text-cyan-400 flex-shrink-0 mt-0.5" />,
};

function AnimatedReviewLines() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setCount((v) => {
        if (v >= REVIEW_LINES.length) {
          setTimeout(() => setCount(0), 1200);
          return v;
        }
        return v + 1;
      });
    }, 650);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mt-4 space-y-2">
      <p className="font-mono text-[10px] text-white/20 mb-2">Analyzing diff...</p>
      {REVIEW_LINES.map((line, i) => {
        const s = LINE_STYLES[line.type as keyof typeof LINE_STYLES];
        return (
          <div
            key={i}
            className={cn(
              "flex items-start gap-2 rounded-lg px-3 py-2 border-l-2 font-mono text-[10px] sm:text-[11px]",
              s.border,
              s.bg,
              "transition-all duration-500",
              i < count ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            {LINE_ICONS[line.type as keyof typeof LINE_ICONS]}
            <div className="min-w-0">
              <span className={cn("font-semibold truncate block", s.file)}>
                {line.file}
                <span className="text-white/25">:{line.line}</span>
              </span>
              <p className="text-white/40 text-[10px] mt-0.5 truncate">{line.msg}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const TIMELINE = [
  { Icon: GitPullRequest, label: "PR #247 opened",           time: "0s",   color: "bg-green-400/15 border-green-400/30 text-green-400" },
  { Icon: GitBranch,      label: "Diff fetched via Octokit", time: "+3s",  color: "bg-cyan-400/15 border-cyan-400/30 text-cyan-400" },
  { Icon: Bot,            label: "AI reviewing...",           time: "+18s", color: "bg-violet-400/15 border-violet-400/30 text-violet-400" },
  { Icon: MessageSquare,  label: "Comment posted to PR",     time: "+28s", color: "bg-green-400/15 border-green-400/30 text-green-400" },
];

function BentoCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useReveal(0.1);
  return (
    <div
      ref={ref}
      className={cn(
        "bento-card transition-all duration-700",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function FeaturesSection() {
  const { ref, visible } = useReveal(0.1);

  return (
    <section id="features" className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-[1160px] mx-auto">

        {/* Header */}
        <div
          ref={ref}
          className={cn(
            "mb-10 sm:mb-14 transition-all duration-700 text-center mx-auto",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          )}
        >
          <div className="section-label">Features</div>
          <h2 className="text-white mb-3 text-balance">Everything in one place</h2>
          <p className="text-white/50 text-[15px] sm:text-[16px] max-w-[480px] leading-relaxed mx-auto">
            Built for developers who ship fast. Every feature fits naturally into your GitHub workflow.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

          {/* Card 1 — AI Review */}
          <BentoCard delay={0} className="p-5 sm:p-7 flex flex-col lg:row-span-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center mb-4">
              <Brain className="h-5 w-5 text-cyan-400" />
            </div>
            <h3 className="text-white mb-2">AI-powered reviews</h3>
            <p className="text-white/40 text-[13px] leading-relaxed">
              Understands context, architecture, and intent — not just syntax. Reviews read like a senior engineer wrote them.
            </p>
            <AnimatedReviewLines />
            <div className="mt-auto pt-4 flex gap-4 text-[11px] sm:text-[12px] font-mono">
              <span className="text-green-400">2 passed</span>
              <span className="text-amber-400">1 warning</span>
              <span className="text-red-400">1 error</span>
            </div>
          </BentoCard>

          {/* Card 2 — Speed + timeline */}
          <BentoCard delay={80} className="p-5 sm:p-7 sm:col-span-2 lg:col-span-2 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
            <div className="flex-1">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center mb-4">
                <Zap className="h-5 w-5 text-amber-400" />
              </div>
              <h3 className="text-white mb-2">Reviews in ~30 seconds</h3>
              <p className="text-white/40 text-[13px] leading-relaxed">
                Inngest async pipeline processes your diff and posts a GitHub comment before your next coffee sip.
              </p>
            </div>
            <div className="flex-1 w-full sm:w-auto">
              {TIMELINE.map((step, i) => (
                <div
                  key={i}
                  className="flex gap-3 items-start py-2.5 border-b border-white/[0.05] last:border-0"
                >
                  <div
                    className={cn(
                      "flex w-7 h-7 flex-shrink-0 items-center justify-center rounded-full border",
                      step.color
                    )}
                  >
                    <step.Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-white">{step.label}</p>
                    <p className="text-[11px] text-white/30 font-mono">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Card 3 — Stats */}
          <BentoCard delay={160} className="p-5 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-white mb-2">Usage dashboard</h3>
              <p className="text-white/40 text-[13px] leading-relaxed">
                Track reviews, history, and billing in one place.
              </p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { val: "28s",   label: "avg review" },
                { val: "99.9%", label: "uptime" },
                { val: "∞",     label: "PRs (Pro)" },
                { val: "2.8k",  label: "reviewed" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-[20px] sm:text-[22px] font-black gradient-text leading-none">
                    {s.val}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-white/30 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Card 4 — Security */}
          <BentoCard delay={240} className="p-5 sm:p-7 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-red-400/10 flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5 text-red-400" />
            </div>
            <h3 className="text-white mb-2">Security scanning</h3>
            <p className="text-white/40 text-[13px] leading-relaxed mb-4">
              Detects injection risks, auth flaws, and exposed secrets on every diff automatically.
            </p>
            <div className="flex flex-wrap gap-2 mt-auto">
              {["SQL Injection", "XSS Risk", "Auth Flaw", "Secret Exposure"].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-400/8 text-red-300 border border-red-400/15"
                >
                  {tag}
                </span>
              ))}
            </div>
          </BentoCard>

        </div>
      </div>
    </section>
  );
}