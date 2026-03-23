"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { GitPullRequest, Menu, X, LogOut, User } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";

const publicLinks = [
  { label: "Features",     href: "/#features"    },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing",      href: "/#pricing"      },
  { label: "FAQ",          href: "/#faq"          },
];

const authLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Pricing",   href: "/pricing"   },
  { label: "FAQ",       href: "/faq"       },
];

export function Navbar() {
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const pathname = usePathname();
  const router   = useRouter();

  const { data: session, isPending } = useSession();
  const isAuthenticated = !!session;
  const links = isAuthenticated ? authLinks : publicLinks;

  // Scroll listener
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-user-menu]")) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    await signOut();
    router.push("/");
  };

  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <>
      {/* ── Pill navbar ── */}
      <header
        className={cn(
          "fixed top-4 left-1/2 z-50 animate-nav-drop",
          "flex items-center gap-0",
          "rounded-full border backdrop-blur-2xl",
          "transition-all duration-500",
          "w-[calc(100%-24px)] sm:w-[calc(100%-48px)] max-w-[840px]",
          "px-2 py-2",
          scrolled
            ? "bg-[rgba(6,6,8,0.94)] border-white/12 shadow-xl shadow-black/50"
            : "bg-[rgba(8,8,10,0.82)] border-white/9"
        )}
        style={{ transform: "translateX(-50%)" }}
      >
        {/* Logo */}
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center gap-2 pl-2 pr-3 flex-shrink-0 group"
        >
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

        {/* Divider */}
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

        {/* Divider */}
        <div className="hidden md:block h-5 w-px bg-white/10 ml-1 flex-shrink-0" />

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-1 pl-2 flex-shrink-0">
          {isPending ? (
            // Loading skeleton
            <div className="w-24 h-8 rounded-full bg-white/8 animate-pulse" />
          ) : isAuthenticated ? (
            // User avatar dropdown
            <div className="relative" data-user-menu>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-full border transition-all duration-200",
                  userMenuOpen
                    ? "bg-white/10 border-white/15"
                    : "border-white/10 hover:bg-white/8 hover:border-white/14"
                )}
              >
                {/* Avatar */}
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name ?? ""}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center flex-shrink-0 text-[10px] font-black text-black">
                    {userInitials}
                  </div>
                )}
                <span className="text-[13px] text-white/70 font-medium max-w-[100px] truncate">
                  {session?.user?.name?.split(" ")[0] ?? "Account"}
                </span>
                {/* Chevron */}
                <svg
                  width="10" height="10" viewBox="0 0 10 10" fill="none"
                  className={cn("text-white/25 transition-transform duration-200", userMenuOpen && "rotate-180")}
                >
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Dropdown */}
              <div className={cn(
                "absolute right-0 top-full mt-2 w-52 bg-[rgba(10,10,14,0.98)] border border-white/10 rounded-2xl p-1.5 shadow-2xl shadow-black/60 backdrop-blur-2xl z-50",
                "transition-all duration-200 origin-top-right",
                userMenuOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
              )}>
                {/* User info */}
                <div className="px-3 py-2.5 border-b border-white/6 mb-1">
                  <p className="text-[13px] font-semibold text-white truncate">
                    {session?.user?.name}
                  </p>
                  <p className="text-[11px] text-white/30 truncate mt-0.5">
                    {session?.user?.email}
                  </p>
                </div>

                {/* Menu items */}
                <Link
                  href="/dashboard"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-white/60 hover:text-white hover:bg-white/6 transition-colors"
                >
                  <User className="h-3.5 w-3.5 flex-shrink-0" />
                  Dashboard
                </Link>

                <Link
                  href="/pricing"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-white/60 hover:text-white hover:bg-white/6 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                    <path d="M7 1L8.5 5H13L9.5 7.5L11 11.5L7 9L3 11.5L4.5 7.5L1 5H5.5L7 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                  </svg>
                  Billing
                </Link>

                {/* Divider + Sign out */}
                <div className="border-t border-white/6 mt-1 pt-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-red-400/80 hover:text-red-400 hover:bg-red-400/8 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5 flex-shrink-0" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Unauthenticated CTAs
            <>
              <Link
                href="/sign-in"
                className="px-3.5 py-2 rounded-full text-[13px] font-medium text-white/50 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/sign-in"
                className="px-4 py-2 rounded-full text-[13px] font-semibold bg-green-400 text-black hover:bg-green-300 shadow-lg shadow-green-500/25 transition-all duration-200"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile right side */}
        <div className="flex md:hidden items-center gap-2 ml-auto pr-1">
          {!isPending && isAuthenticated && session?.user?.image ? (
            <img
              src={session.user.image}
              alt=""
              className="w-7 h-7 rounded-full object-cover border border-white/10"
            />
          ) : !isPending && isAuthenticated ? (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center text-[10px] font-black text-black">
              {userInitials}
            </div>
          ) : !isPending ? (
            <Link
              href="/sign-in"
              className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold bg-green-400 text-black hover:bg-green-300 transition-all duration-200"
            >
              Get Started
            </Link>
          ) : null}

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
        <div className="bg-[rgba(8,8,12,0.98)] border border-white/10 rounded-2xl backdrop-blur-2xl p-3 shadow-2xl shadow-black/60">

          {/* User info on mobile when authenticated */}
          {isAuthenticated && (
            <div className="flex items-center gap-3 px-3 py-2.5 mb-2 border-b border-white/6">
              {session?.user?.image ? (
                <img src={session.user.image} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center text-[12px] font-black text-black flex-shrink-0">
                  {userInitials}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-white truncate">{session?.user?.name}</p>
                <p className="text-[11px] text-white/30 truncate">{session?.user?.email}</p>
              </div>
            </div>
          )}

          {/* Nav links */}
          <nav className="flex flex-col gap-1 mb-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-xl text-[14px] font-medium transition-colors",
                  pathname === link.href
                    ? "text-white bg-white/8"
                    : "text-white/60 hover:text-white hover:bg-white/6"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-white/8 pt-3 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[14px] font-semibold text-red-400/80 hover:text-red-400 hover:bg-red-400/8 border border-red-400/15 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-[14px] font-medium text-white/50 hover:text-white hover:bg-white/6 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-[14px] font-semibold bg-green-400 text-black hover:bg-green-300 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}