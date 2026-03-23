"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { GitPullRequest, Menu, X } from "lucide-react";

interface NavbarProps {
  isAuthenticated?: boolean;
}

const publicLinks = [
  { label: "Features",     href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing",      href: "/#pricing" },
  { label: "FAQ",          href: "/#faq" },
];

const authLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Pricing",   href: "/pricing" },
  { label: "FAQ",       href: "/faq" },
];

export function Navbar({ isAuthenticated = false }: NavbarProps) {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const links = isAuthenticated ? authLinks : publicLinks;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      {/* ── Pill navbar ── */}
      <header
        className={cn(
          "fixed top-4 left-1/2 z-50 animate-nav-drop",
          "flex items-center gap-0",
          "rounded-full border backdrop-blur-2xl",
          "transition-all duration-500",
          /* width: full minus padding on mobile, capped on desktop */
          "w-[calc(100%-24px)] sm:w-[calc(100%-48px)] max-w-[840px]",
          /* pill padding */
          "px-2 py-2",
          scrolled
            ? "bg-[rgba(6,6,8,0.94)] border-white/12 shadow-xl shadow-black/50"
            : "bg-[rgba(8,8,10,0.82)] border-white/9"
        )}
        style={{ transform: "translateX(-50%)" }}
      >
        {/* Logo */}
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 pl-2 pr-3 flex-shrink-0 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-green-400/30 blur-sm group-hover:blur-md transition-all duration-300" />
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-cyan-500">
              <GitPullRequest className="h-3.5 w-3.5 text-black" strokeWidth={2.5} />
            </div>
          </div>
          <span className="text-[14px] font-semibold text-white tracking-tight">
            PRReview<span className="text-green-400">.ai</span>
          </span>
        </Link>

        {/* Divider — hide on small screens */}
        <div className="hidden md:block h-5 w-px bg-white/10 mr-1 flex-shrink-0" />

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3.5 py-2 rounded-full text-[13px] font-medium transition-all duration-200 whitespace-nowrap",
                pathname === link.href
                  ? "text-white bg-white/8"
                  : "text-white/50 hover:text-white hover:bg-white/6"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Divider — hide on small screens */}
        <div className="hidden md:block h-5 w-px bg-white/10 ml-1 flex-shrink-0" />

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-1 pl-2 flex-shrink-0">
          {isAuthenticated ? (
            <Link href="/dashboard" className="px-4 py-2 rounded-full text-[13px] font-semibold bg-green-400 text-black hover:bg-green-300 transition-all duration-200">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="px-3.5 py-2 rounded-full text-[13px] font-medium text-white/50 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link href="/sign-up" className="px-4 py-2 rounded-full text-[13px] font-semibold bg-green-400 text-black hover:bg-green-300 shadow-lg shadow-green-500/25 transition-all duration-200">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile: Sign up pill + hamburger */}
        <div className="flex md:hidden items-center gap-2 ml-auto pr-1">
          <Link href="/sign-up" className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold bg-green-400 text-black hover:bg-green-300 transition-all duration-200">
            Get Started
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/8 transition-colors"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* ── Mobile dropdown ── */}
      <div
        className={cn(
          "fixed left-1/2 z-40 md:hidden",
          "w-[calc(100%-24px)] sm:w-[calc(100%-48px)] max-w-[480px]",
          "transition-all duration-300",
          mobileOpen
            ? "top-[80px] opacity-100 pointer-events-auto"
            : "top-[68px] opacity-0 pointer-events-none"
        )}
        style={{ transform: "translateX(-50%)" }}
      >
        <div className="bg-[rgba(8,8,12,0.96)] border border-white/10 rounded-2xl backdrop-blur-2xl p-3 shadow-2xl shadow-black/60">
          <nav className="flex flex-col gap-1 mb-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-[14px] font-medium text-white/60 hover:text-white hover:bg-white/6 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-white/8 pt-3 flex flex-col gap-2">
            <Link href="/sign-in" onClick={() => setMobileOpen(false)} className="w-full text-center py-2.5 rounded-xl text-[14px] font-medium text-white/50 hover:text-white hover:bg-white/6 transition-colors">
              Sign in
            </Link>
            <Link href="/sign-up" onClick={() => setMobileOpen(false)} className="w-full text-center py-2.5 rounded-xl text-[14px] font-semibold bg-green-400 text-black hover:bg-green-300 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}