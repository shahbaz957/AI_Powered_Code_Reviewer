"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { GitPullRequest } from "lucide-react";

interface NavbarProps {
  isAuthenticated?: boolean;
}

const publicLinks = [
  { label: "Features",    href: "/#features" },
  { label: "How it works",href: "/#how-it-works" },
  { label: "Pricing",     href: "/pricing" },
  { label: "FAQ",         href: "/faq" },
];

const authLinks = [
  { label: "Dashboard",   href: "/dashboard" },
  { label: "Pricing",     href: "/pricing" },
  { label: "FAQ",         href: "/faq" },
];

export function Navbar({ isAuthenticated = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile on route change
  useEffect(() => setMobileOpen(false), [pathname]);

  const links = isAuthenticated ? authLinks : publicLinks;

  return (
    <>
      {/* ── Pill navbar ── */}
      <header
        className={cn(
          /* Base: fixed, centered, pill shape */
          "fixed top-5 left-1/2 z-50",
          "animate-nav-drop",
          /* Pill sizing */
          "flex items-center gap-0",
          "px-2 py-2",
          "rounded-full",
          /* Color */
          "border transition-all duration-500",
          scrolled
            ? "bg-[rgba(6,6,8,0.92)] border-[rgba(255,255,255,0.11)] shadow-xl shadow-black/40"
            : "bg-[rgba(8,8,10,0.82)] border-[rgba(255,255,255,0.09)]",
          /* Blur */
          "backdrop-blur-2xl",
          /* Min width so it doesn't collapse */
          "min-w-[680px] max-w-[840px] w-[calc(100%-48px)]"
        )}
        style={{ transform: "translateX(-50%)" }}
      >
        {/* Logo */}
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center gap-2.5 pl-2 pr-4 group flex-shrink-0"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-green-400/30 blur-sm group-hover:blur-md transition-all duration-300" />
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-cyan-500">
              <GitPullRequest className="h-3.5 w-3.5 text-black" strokeWidth={2.5} />
            </div>
          </div>
          <span className="text-[14px] font-700 text-white tracking-tight">
            PRReview<span className="text-green-400">.ai</span>
          </span>
        </Link>

        {/* Divider */}
        <div className="h-5 w-px bg-white/10 mr-1 flex-shrink-0" />

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href.startsWith("/#") && pathname === "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-full text-[13.5px] font-medium transition-all duration-200 whitespace-nowrap",
                  isActive
                    ? "text-white bg-white/8"
                    : "text-white/50 hover:text-white hover:bg-white/6"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="h-5 w-px bg-white/10 ml-1 flex-shrink-0 hidden md:block" />

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-1 pl-2 flex-shrink-0">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className={cn(
                "px-4 py-2 rounded-full text-[13.5px] font-600",
                "bg-green-400 text-black hover:bg-green-300",
                "transition-all duration-200"
              )}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 rounded-full text-[13.5px] font-medium text-white/50 hover:text-white transition-colors duration-200"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className={cn(
                  "px-4 py-2 rounded-full text-[13.5px] font-600",
                  "bg-green-400 text-black",
                  "hover:bg-green-300 transition-all duration-200",
                  "shadow-lg shadow-green-500/25"
                )}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden ml-auto mr-1 flex h-8 w-8 items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/8 transition-colors"
          aria-label="Toggle menu"
        >
          <div className="flex flex-col gap-1.5 w-4">
            <span className={cn(
              "block h-px bg-current transition-all duration-300 origin-center",
              mobileOpen ? "rotate-45 translate-y-[9px]" : ""
            )} />
            <span className={cn(
              "block h-px bg-current transition-all duration-200",
              mobileOpen ? "opacity-0" : ""
            )} />
            <span className={cn(
              "block h-px bg-current transition-all duration-300 origin-center",
              mobileOpen ? "-rotate-45 -translate-y-[9px]" : ""
            )} />
          </div>
        </button>
      </header>

      {/* ── Mobile menu (drops below pill) ── */}
      <div
        className={cn(
          "fixed left-1/2 z-40 md:hidden",
          "w-[calc(100%-48px)] max-w-[420px]",
          "transition-all duration-300",
          mobileOpen
            ? "top-[88px] opacity-100 pointer-events-auto"
            : "top-[76px] opacity-0 pointer-events-none"
        )}
        style={{ transform: "translateX(-50%)" }}
      >
        <div className="glass rounded-2xl p-3 shadow-2xl shadow-black/60">
          <nav className="flex flex-col gap-1 mb-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/6 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-white/8 pt-3 flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-3 rounded-xl text-sm font-600 bg-green-400 text-black hover:bg-green-300 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/6 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-3 rounded-xl text-sm font-600 bg-green-400 text-black hover:bg-green-300 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}