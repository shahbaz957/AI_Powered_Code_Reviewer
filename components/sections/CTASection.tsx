"use client";

import Link from "next/link";
import { GitPullRequest, Github, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";

export function CTASection() {
  return (
    <section className="relative z-10 py-20 sm:py-28 px-4 sm:px-6 text-center overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[300px] sm:h-[400px] rounded-full bg-green-400/5 blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-green-400/25 to-transparent" />

      <div className="relative max-w-[1160px] mx-auto">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-green-400 to-cyan-500 shadow-xl shadow-green-500/30 mb-6 sm:mb-8">
          <GitPullRequest className="h-7 w-7 sm:h-8 sm:h-8 text-black" strokeWidth={2.5} />
        </div>

        <h2 className="text-white mb-4 text-balance">
          Ship with confidence,{" "}
          <span className="gradient-text">every single PR</span>
        </h2>
        <p className="text-white/45 text-[15px] sm:text-[17px] max-w-[340px] sm:max-w-[440px] mx-auto leading-relaxed mb-8 sm:mb-10 text-balance">
          Join thousands of developers getting smarter code reviews automatically.
          Free to start — no credit card required.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-[280px] sm:max-w-none mx-auto">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-full text-[14px] sm:text-[15px] font-semibold text-black bg-green-400 hover:bg-green-300 shadow-xl shadow-green-500/30 transition-all duration-200 hover:scale-[1.02]"
          >
            Start reviewing free →
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 rounded-full text-[14px] sm:text-[15px] font-medium text-white/70 bg-white/6 border border-white/10 hover:bg-white/10 hover:text-white backdrop-blur-sm transition-all duration-200"
          >
            View pricing
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/6 py-12 sm:py-14 px-4 sm:px-6">
      <div className="max-w-[1160px] mx-auto">

        {/* Grid — 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12 mb-10 sm:mb-12">

          {/* Brand — full width on mobile */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-cyan-500">
                <GitPullRequest className="h-3.5 w-3.5 text-black" strokeWidth={2.5} />
              </div>
              <span className="text-[14px] font-semibold text-white">
                PRReview<span className="text-green-400">.ai</span>
              </span>
            </div>
            <p className="text-[12px] sm:text-[12.5px] text-white/30 leading-relaxed max-w-[220px]">
              AI code reviews on every pull request. Built with Next.js, Claude, and Inngest.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-white/25 mb-3 sm:mb-4">Product</h4>
            {[
              { label: "Features",     href: "/#features" },
              { label: "How it works", href: "/#how-it-works" },
              { label: "Pricing",      href: "/pricing" },
              { label: "FAQ",          href: "/faq" },
            ].map((link) => (
              <Link key={link.label} href={link.href} className="block text-[12px] sm:text-[13px] text-white/35 hover:text-white/70 mb-2 sm:mb-2.5 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-white/25 mb-3 sm:mb-4">Legal</h4>
            {[
              { label: "Privacy",  href: "/privacy" },
              { label: "Terms",    href: "/terms" },
              { label: "Security", href: "/security" },
            ].map((link) => (
              <Link key={link.label} href={link.href} className="block text-[12px] sm:text-[13px] text-white/35 hover:text-white/70 mb-2 sm:mb-2.5 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-white/25 mb-3 sm:mb-4">Connect</h4>
            {[
              { label: "GitHub",  href: "https://github.com",  Icon: Github },
              { label: "Twitter", href: "https://twitter.com", Icon: Twitter },
            ].map(({ label, href, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-[12px] sm:text-[13px] text-white/35 hover:text-white/70 mb-2 sm:mb-2.5 transition-colors">
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-6 sm:pt-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-[11px] sm:text-[12px] text-white/20">© {year} PRReview.ai · All rights reserved</p>
          <p className="text-[11px] sm:text-[12px] text-white/20">
            Built with{" "}
            <span className="text-green-400/70">Next.js</span>
            {" · "}
            <span className="text-violet-400/70">Claude</span>
            {" · "}
            <span className="text-cyan-400/70">Inngest</span>
          </p>
        </div>
      </div>
    </footer>
  );
}