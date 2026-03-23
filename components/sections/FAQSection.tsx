"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useReveal } from "@/hooks/useReveal";

const faqs = [
  { q: "How does the AI review know about my codebase?", a: "Each review includes the full diff with file names and surrounding context. Claude understands the purpose of each change based on the PR title, description, and adjacent code — not just isolated lines." },
  { q: "Will my code be stored or used for training?", a: "No. Your code is processed transiently during review generation and is never stored. We do not use your code to train any models. The review result is saved, but not the raw source code." },
  { q: "What languages does it support?", a: "Any language GitHub supports — TypeScript, Python, Go, Rust, Java, Ruby, PHP, and more. The AI adapts its feedback to the idioms and conventions of each language." },
  { q: "How long does a review take?", a: "The median review time is ~28 seconds from PR open to GitHub comment posted. This includes fetching the diff, generating the review via Claude, and posting the comment. Large diffs may take up to 90 seconds." },
  { q: "Can I customize what the review focuses on?", a: "On the Team plan you can define custom review rules — enforce naming conventions, ban specific patterns, or focus on security-critical files. This is on the roadmap for Pro as well." },
  { q: "What if the review fails?", a: "Inngest handles retry logic automatically — up to 3 retries with exponential backoff. If all retries fail, a failure comment is posted on the PR and you can trigger a re-review from your dashboard." },
  { q: "Does it work with private repositories?", a: "Yes. The GitHub OAuth scope includes private repos. Your token is stored encrypted and scoped only to the repositories you explicitly connect." },
  { q: "Can I cancel anytime?", a: "Yes. Cancel from your billing settings at any time. You keep access until the end of your billing period. No long-term contracts." },
];

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const { ref, visible } = useReveal(0.05);

  return (
    <div
      ref={ref}
      className={cn("border-b border-white/6 transition-all duration-500", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}
      style={{ transitionDelay: `${index * 40}ms` }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 py-4 sm:py-5 text-left bg-transparent border-0 cursor-pointer group"
      >
        <span className={cn("text-[13px] sm:text-[14px] font-semibold transition-colors duration-200 leading-snug", open ? "text-green-400" : "text-white/75 group-hover:text-white")}>
          {faq.q}
        </span>
        <div className={cn("flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300", open ? "border-green-400/40 bg-green-400/8 text-green-400 rotate-45" : "border-white/14 text-white/30")}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </button>
      <div className={cn("overflow-hidden transition-all duration-300", open ? "max-h-48 pb-4 sm:pb-5" : "max-h-0")}>
        <p className="text-[13px] sm:text-[13.5px] text-white/40 leading-relaxed">{faq.a}</p>
      </div>
    </div>
  );
}

export function FAQSection() {
  const { ref, visible } = useReveal(0.1);

  return (
    <section id="faq" className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

      <div className="max-w-[1160px] mx-auto">
        {/* On mobile: stacked. On desktop: side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-10 sm:gap-16 lg:gap-20">

          {/* Left heading */}
          <div
            ref={ref}
            className={cn("transition-all duration-700", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5")}
          >
            <div className="section-label">FAQ</div>
            <h2 className="text-white mb-4 text-balance">Common questions</h2>
            <p className="text-white/40 text-[14px] sm:text-[15px] leading-relaxed">
              Can&apos;t find what you&apos;re looking for?{" "}
              <a href="mailto:hi@prreview.ai" className="text-green-400 hover:text-green-300 transition-colors">
                Email us
              </a>
            </p>
          </div>

          {/* Right accordion */}
          <div>
            {faqs.map((faq, i) => (
              <FAQItem key={faq.q} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}