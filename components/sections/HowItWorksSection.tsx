"use client";

import { cn } from "@/lib/utils";
import { useReveal } from "@/hooks/useReveal";
import {
  Github,
  GitPullRequest,
  Bot,
  MessageSquare,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";

export function HowItWorksSection() {
  const { ref, visible } = useReveal(0.1);

  return (
    <section id="how-it-works" className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-violet-400/20 to-transparent" />

      <div className="max-w-[1160px] mx-auto">

        {/* Header */}
        <div
          ref={ref}
          className={cn(
            "text-center mb-10 sm:mb-14 transition-all duration-700",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          )}
        >
          <div className="section-label justify-center">From chaos to clarity</div>
          <h2 className="text-white mb-3 text-balance">See exactly how it works</h2>
          <p className="text-white/50 text-[15px] sm:text-[16px] max-w-[460px] mx-auto leading-relaxed">
            Every PR, automatically reviewed. No manual steps, no context switching.
          </p>
        </div>

        {/* Problem / Solution */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <ProblemCard />
          <SolutionCard />
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STEPS.map((step, i) => (
            <StepCard key={step.title} step={step} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemCard() {
  const { ref, visible } = useReveal(0.1);
  return (
    <div
      ref={ref}
      className={cn(
        "bento-card p-6 sm:p-8 transition-all duration-700",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      )}
    >
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
        <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400">Problem</span>
      </div>
      <h3 className="text-white text-[18px] sm:text-[20px] font-bold mb-3 leading-snug">
        PRs merge without proper review
      </h3>
      <p className="text-white/40 text-[13px] leading-relaxed mb-5">
        Manual code reviews are slow, inconsistent, and often skipped under deadline pressure.
      </p>
      <div className="bg-black/40 rounded-2xl border border-white/6 overflow-hidden">
        <div className="flex items-center gap-2 px-3 sm:px-4 py-3 border-b border-white/5 bg-white/2">
          <div className="w-5 h-5 rounded-md bg-[#24292e] flex items-center justify-center flex-shrink-0">
            <Github className="h-3 w-3 text-white" />
          </div>
          <span className="text-[11px] sm:text-[12px] text-white/50 font-mono truncate">
            feat: add payment processing
          </span>
        </div>
        <div className="px-3 sm:px-4 py-3">
          <div className="text-[10px] sm:text-[11px] text-white/30 font-mono mb-2">
            alexk · 12 files · +847 −23
          </div>
          <div className="text-[12px] text-white/60 italic mb-3">
            &ldquo;LGTM, merging before EOD&rdquo;
          </div>
          <div className="flex items-start gap-2 text-[11px] text-red-400 bg-red-400/6 border border-red-400/15 rounded-lg px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-red-400" />
            <span>SQL injection vulnerability merged to main</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SolutionCard() {
  const { ref, visible } = useReveal(0.1);
  return (
    <div
      ref={ref}
      className={cn(
        "bento-card border-green-400/12 bg-green-400/[0.03] p-6 sm:p-8 transition-all duration-700 delay-100",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      )}
    >
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
        <span className="text-[10px] font-bold tracking-widest uppercase text-green-400">Solution</span>
      </div>
      <h3 className="text-white text-[18px] sm:text-[20px] font-bold mb-3 leading-snug">
        Instant AI review on every PR
      </h3>
      <p className="text-white/40 text-[13px] leading-relaxed mb-5">
        The moment a PR opens, PRReview.ai analyzes the full diff and posts detailed, actionable
        feedback as inline GitHub comments.
      </p>
      <div className="bg-black/40 rounded-2xl border border-white/6 overflow-hidden">
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-white/5 bg-white/2">
          <div className="flex gap-1.5 flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <span className="text-[10px] sm:text-[11px] text-white/30 font-mono truncate">
            api/payments.ts · line 34
          </span>
        </div>
        <div className="px-3 sm:px-4 py-3 font-mono text-[10px] sm:text-[11px] space-y-1.5">
          <div className="text-white/30 truncate">{"  const userId = req.params.id;"}</div>
          <div className="bg-red-400/8 text-red-300 px-1.5 rounded truncate">
            {"- const q = `SELECT * FROM users WHERE id = ${userId}`;"}
          </div>
          <div className="bg-green-400/8 text-green-300 px-1.5 rounded truncate">
            {"+ const q = `SELECT * FROM users WHERE id = $1`;"}
          </div>
          <div className="bg-green-400/8 text-green-300 px-1.5 rounded">
            {"+ db.query(q, [userId]);"}
          </div>
        </div>
        <div className="mx-3 sm:mx-4 mb-3 sm:mb-4 bg-cyan-400/6 border border-cyan-400/15 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-4 h-4 rounded-md bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center text-[8px] font-black text-black flex-shrink-0">
              PR
            </div>
            <span className="text-[9px] font-bold tracking-widest uppercase text-cyan-400">
              AI Review
            </span>
          </div>
          <div className="flex items-start gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-white/60 leading-relaxed">
              SQL injection vulnerability. Use parameterized queries instead of string interpolation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  {
    num: "01",
    Icon: Github,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
    title: "Connect repo",
    desc: "Sign in with GitHub, connect a repo. Webhook registered automatically.",
  },
  {
    num: "02",
    Icon: GitPullRequest,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
    title: "Open a PR",
    desc: "Push your branch and open a PR normally. Webhook fires instantly.",
  },
  {
    num: "03",
    Icon: Bot,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    title: "AI analyzes",
    desc: "Claude reads the full diff with context and generates a structured review.",
  },
  {
    num: "04",
    Icon: MessageSquare,
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
    title: "Comment posted",
    desc: "Inline GitHub comments appear on your PR with file-level feedback.",
  },
];

function StepCard({
  step,
  delay,
}: {
  step: (typeof STEPS)[0];
  delay: number;
}) {
  const { ref, visible } = useReveal(0.1);
  return (
    <div
      ref={ref}
      className={cn(
        "bento-card p-4 sm:p-6 transition-all duration-700",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border",
            step.bg,
            step.border
          )}
        >
          <step.Icon className={cn("h-4 w-4", step.color)} />
        </div>
        <span className={cn("text-[11px] font-bold font-mono", step.color)}>
          {step.num}
        </span>
      </div>
      <h4 className="text-white font-semibold mb-1.5 text-[13px] sm:text-[14px]">
        {step.title}
      </h4>
      <p className="text-white/40 text-[11px] sm:text-[12px] leading-relaxed">
        {step.desc}
      </p>
    </div>
  );
}