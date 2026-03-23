"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FlowCanvas } from "@/components/ui/FlowCanvas";

const WORDS = ["reimagined.", "automated.", "AI-powered.", "instant."];

const AVATARS = [
  { initials: "AK", bg: "from-blue-900 to-blue-950" },
  { initials: "SM", bg: "from-violet-900 to-violet-950" },
  { initials: "TR", bg: "from-emerald-900 to-emerald-950" },
  { initials: "PW", bg: "from-orange-900 to-orange-950" },
  { initials: "JD", bg: "from-pink-900 to-pink-950" },
  { initials: "ML", bg: "from-teal-900 to-teal-950" },
];

export function HeroSection() {
  const [wordIdx, setWordIdx] = useState(0);
  const [wordKey, setWordKey] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setWordIdx((i) => (i + 1) % WORDS.length);
      setWordKey((k) => k + 1);
    }, 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-24 sm:pt-28 pb-16 sm:pb-20 z-10 overflow-hidden">
      {/* Radial glow */}
      <FlowCanvas />
      <div className="absolute inset-x-0 top-1/4 h-[400px] sm:h-[500px] bg-radial-green pointer-events-none" />

      {/* Eyebrow */}
      <div className="animate-fade-up mb-6 sm:mb-8">
        <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-green-400/25 bg-green-400/7 text-[11px] sm:text-[12px] font-semibold text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-dot flex-shrink-0" />
          AI Powered Reviews
          <span className="w-px h-3 bg-green-400/30 hidden sm:block" />
          <span className="hidden sm:inline">Now in Beta</span>
        </span>
      </div>

      {/* Headline */}
      <div className="animate-fade-up delay-100 mb-5 sm:mb-6 space-y-1">
        <h1 className="gradient-text-hero text-balance">Code reviews,</h1>
        <h1>
          <span key={wordKey} className="animate-word-in gradient-text inline-block py-2.5">
            {WORDS[wordIdx]}
          </span>
        </h1>
      </div>

      {/* Sub */}
      <p className="animate-fade-up delay-200 text-[15px] sm:text-[17px] text-white/50 max-w-[340px] sm:max-w-[440px] leading-relaxed mb-8 sm:mb-10 text-balance">
        Connect your GitHub repo. Every pull request gets an instant AI review
        posted as native inline comments in ~30 seconds.
      </p>

      {/* CTAs */}
      <div className="animate-fade-up delay-300 flex flex-col sm:flex-row gap-3 justify-center mb-10 sm:mb-12 w-full max-w-[340px] sm:max-w-none">
        <Link
          href="/sign-up"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-3 rounded-full text-[15px] font-semibold text-black bg-green-400 hover:bg-green-300 shadow-lg shadow-green-500/30 transition-all duration-200 hover:scale-[1.02]"
        >
          Get started free <span className="text-black/60">→</span>
        </Link>
        <Link
          href="/#how-it-works"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[15px] font-medium text-white/70 bg-white/6 border border-white/10 hover:bg-white/10 hover:text-white backdrop-blur-sm transition-all duration-200"
        >
          See how it works
        </Link>
      </div>

      {/* Avatar stack */}
      <div className="animate-fade-up delay-400 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <div className="flex items-center">
          {AVATARS.map((av, i) => (
            <div
              key={av.initials}
              className={cn(
                "relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full",
                "border-2 border-black bg-gradient-to-br text-[10px] sm:text-[11px] font-bold text-white/80",
                av.bg
              )}
              style={{ marginLeft: i === 0 ? 0 : -8, zIndex: AVATARS.length - i }}
            >
              {av.initials}
            </div>
          ))}
        </div>
        <p className="text-[12px] sm:text-[13px] text-white/40 text-center sm:text-left">
          <span className="text-white font-semibold">+2,847 developers</span>{" "}
          already reviewing smarter
        </p>
      </div>
    </section>
  );
}