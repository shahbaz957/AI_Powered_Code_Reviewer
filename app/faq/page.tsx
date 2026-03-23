"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, MessageSquare, Github, Mail } from "lucide-react";

const CATEGORIES = [
  {
    label: "Product",
    faqs: [
      { q: "How does the AI review work?", a: "When a PR is opened on your connected repo, a GitHub webhook fires instantly. We fetch the full diff via Octokit, send it to our AI (Groq) with a structured prompt, and post the resulting inline comments directly on your PR — all within seconds." },
      { q: "What does the AI actually look at?", a: "The AI reviews the full diff with surrounding context, the PR title, and description. It flags security vulnerabilities, performance anti-patterns, logic errors, and style inconsistencies. Each comment includes a suggested fix." },
      { q: "What languages and frameworks are supported?", a: "Any language GitHub can render diffs for: TypeScript, JavaScript, Python, Go, Rust, Java, Ruby, PHP, Swift, Kotlin, and more. The AI adapts its feedback to each language's idioms and conventions." },
      { q: "How fast are reviews?", a: "Median review time is ~26 seconds from PR open to GitHub comment posted. This covers diff fetching, AI analysis, and comment posting. Very large diffs (1000+ lines) may take up to 90 seconds." },
    ],
  },
  {
    label: "Privacy & Security",
    faqs: [
      { q: "Is my code stored anywhere?", a: "No. Your code is processed transiently — the raw diff is sent to the AI, the review is generated, and the diff is immediately discarded. Only the review result (comments, summary, severity) is stored in our database." },
      { q: "Is my code used to train AI models?", a: "Never. Your code is used only to generate your review and is immediately discarded. We have no rights to use your code for any other purpose." },
      { q: "What GitHub permissions does this need?", a: "We request the `repo` scope (to read diffs and post comments) and `user:email` scope (to get your email for summary notifications). We never push code or modify branches." },
      { q: "What if I disconnect a repo?", a: "We immediately uninstall the webhook from GitHub. No new reviews will be triggered. Existing review records remain in your history unless you explicitly delete them." },
    ],
  },
  {
    label: "Billing",
    faqs: [
      { q: "When will I be charged?", a: "Immediately upon subscribing. Monthly plans renew on the same day each month. Yearly plans are billed once upfront." },
      { q: "What happens at the free limit?", a: "Reviews pause at 10/month on the Free plan. Your repos stay connected and nothing is removed — reviews resume at the start of the next calendar month, or immediately if you upgrade." },
      { q: "Do you offer refunds?", a: "Yes — 7-day money-back guarantee, no questions asked. Email hi@prreview.ai within 7 days of your first payment." },
      { q: "Can I cancel anytime?", a: "Yes. Cancel from Settings → Billing. You retain access until the end of your billing period. No penalties, no data loss." },
    ],
  },
  {
    label: "Technical",
    faqs: [
      { q: "What if a review fails?", a: "Inngest automatically retries failed jobs up to 3 times with exponential backoff. If all retries fail, a failure notice is posted on the PR and the event appears in your dashboard for manual re-trigger." },
      { q: "Can I review very large PRs?", a: "PRs over ~800 changed lines are automatically truncated with a note. The AI reviews the most impactful files first. We plan to add per-file chunked reviews in a future update." },
      { q: "Can I customize what gets reviewed?", a: "Custom review rules (focus on specific file patterns, suppress certain comment types, add domain-specific checks) are available on the Team plan. Pro rules are on our roadmap." },
      { q: "Do you support GitHub Enterprise?", a: "GitHub Enterprise Server support is available on the Enterprise plan. Contact us at enterprise@prreview.ai to discuss setup." },
    ],
  },
];

function FAQItem({ faq, index }: { faq: { q: string; a: string }; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("border-b border-white/[0.06] transition-all duration-300", open && "border-white/8")}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-4 py-4 sm:py-5 text-left group"
      >
        <span className={cn(
          "text-[13px] sm:text-[14px] font-medium transition-colors duration-200 leading-snug pt-0.5",
          open ? "text-green-400" : "text-white/65 group-hover:text-white"
        )}>
          {faq.q}
        </span>
        <div className={cn(
          "flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300 mt-0.5",
          open ? "border-green-400/40 bg-green-400/8 rotate-45" : "border-white/12 text-white/30"
        )}>
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M4.5 1v7M1 4.5h7" stroke={open ? "rgb(74 222 128)" : "rgba(255,255,255,0.4)"} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </button>
      <div className={cn("overflow-hidden transition-all duration-300", open ? "max-h-48 pb-4 sm:pb-5" : "max-h-0")}>
        <p className="text-[13px] sm:text-[13.5px] text-white/40 leading-relaxed pr-8">{faq.a}</p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("Product");

  return (
    <div className="min-h-screen bg-black">
      <div className="pt-28 pb-20 px-4 sm:px-6 max-w-[860px] mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-5">
            <MessageSquare className="h-3.5 w-3.5 text-white/40" />
            <span className="text-[12px] text-white/40 font-medium">Help Center</span>
          </div>
          <h1 className="text-[32px] sm:text-[48px] font-black text-white tracking-tight leading-tight mb-3">
            Frequently asked<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">questions</span>
          </h1>
          <p className="text-white/35 text-[14px] sm:text-[16px] max-w-[360px] mx-auto">
            Everything about PRReview.ai. Can&apos;t find what you need?{" "}
            <a href="mailto:hi@prreview.ai" className="text-green-400/80 hover:text-green-400 transition-colors">
              Email us.
            </a>
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.label)}
              className={cn(
                "px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0",
                activeCategory === cat.label
                  ? "bg-green-400/15 text-green-400 border border-green-400/25"
                  : "text-white/35 hover:text-white/70 hover:bg-white/5 border border-transparent"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ list */}
        <div className="mb-14">
          {CATEGORIES.find((c) => c.label === activeCategory)?.faqs.map((faq, i) => (
            <FAQItem key={faq.q} faq={faq} index={i} />
          ))}
        </div>

        {/* Still need help */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="mailto:hi@prreview.ai"
            className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/16 hover:bg-white/[0.05] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-green-400/10 border border-green-400/20 flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <div className="text-[14px] font-bold text-white group-hover:text-green-400 transition-colors">Email support</div>
              <div className="text-[12px] text-white/35">hi@prreview.ai · we reply within 24h</div>
            </div>
          </a>
          <a
            href="https://github.com/islamkhan/pr-reviewer/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/16 hover:bg-white/[0.05] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              <Github className="h-5 w-5 text-white/50 group-hover:text-white transition-colors" />
            </div>
            <div>
              <div className="text-[14px] font-bold text-white group-hover:text-white transition-colors">GitHub Issues</div>
              <div className="text-[12px] text-white/35">Report bugs or request features</div>
            </div>
          </a>
        </div>

      </div>
    </div>
  );
}