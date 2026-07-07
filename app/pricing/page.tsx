"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Check, X, Zap, Shield, Users, Building2, CreditCard,
  Lock, RefreshCw, Star, GitPullRequest, AlertTriangle,
  ChevronDown, ExternalLink, Sparkles
} from "lucide-react";

// ── Plan data ────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Perfect for solo developers and open source contributors.",
    cta: "Current plan",
    ctaHref: "/dashboard",
    ctaVariant: "current",
    badge: null,
    icon: Zap,
    iconColor: "text-white/40",
    iconBg: "bg-white/5",
    features: [
      { text: "10 PR reviews / month",          included: true  },
      { text: "1 repository",                    included: true  },
      { text: "GitHub inline comments",          included: true  },
      { text: "Security scanning",               included: true  },
      { text: "7-day review history",            included: true  },
      { text: "AI-generated summary email",      included: true  },
      { text: "Priority review queue",           included: false },
      { text: "Unlimited repositories",          included: false },
      { text: "90-day review history",           included: false },
      { text: "Analytics dashboard",             included: false },
      { text: "Custom review rules",             included: false },
      { text: "SAML SSO",                        included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 15,
    yearlyPrice: 12,
    description: "For developers and teams who ship continuously.",
    cta: "Upgrade to Pro",
    ctaHref: "/api/checkout?plan=pro",
    ctaVariant: "primary",
    badge: "Most popular",
    icon: Shield,
    iconColor: "text-green-400",
    iconBg: "bg-green-400/10",
    features: [
      { text: "Unlimited PR reviews",            included: true  },
      { text: "Unlimited repositories",          included: true  },
      { text: "GitHub inline comments",          included: true  },
      { text: "Security + performance scan",     included: true  },
      { text: "Priority review queue",           included: true  },
      { text: "90-day review history",           included: true  },
      { text: "Analytics dashboard",             included: true  },
      { text: "AI-generated summary email",      included: true  },
      { text: "Custom review rules",             included: false },
      { text: "SAML SSO",                        included: false },
    ],
  },
  {
    id: "team",
    name: "Team",
    monthlyPrice: 49,
    yearlyPrice: 39,
    description: "For engineering teams with compliance and customization needs.",
    cta: "Get Team",
    ctaHref: "/api/checkout?plan=team",
    ctaVariant: "ghost",
    badge: null,
    icon: Users,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-400/10",
    features: [
      { text: "Everything in Pro",               included: true  },
      { text: "5 team seats (+ $8/seat)",        included: true  },
      { text: "Custom review rules",             included: true  },
      { text: "SAML SSO",                        included: true  },
      { text: "Audit log",                       included: true  },
      { text: "Unlimited history",               included: true  },
      { text: "Dedicated Slack support",         included: true  },
      { text: "SLA guarantee",                   included: true  },
    ],
  },
];

const PAYMENT_FEATURES = [
  {
    icon: CreditCard,
    title: "Powered by Polar.sh",
    desc: "All payments processed through Polar — a developer-first billing platform. Cards, bank transfers, and crypto accepted.",
  },
  {
    icon: Lock,
    title: "PCI-DSS compliant",
    desc: "Your card details are never stored on our servers. All transactions are encrypted and handled by Polar's secure infrastructure.",
  },
  {
    icon: RefreshCw,
    title: "Cancel anytime",
    desc: "No lock-in. Cancel from your billing settings at any time. Access continues until end of billing period.",
  },
  {
    icon: RefreshCw,
    title: "Instant activation",
    desc: "Your plan upgrades immediately after payment. No waiting, no manual approval — unlimited reviews start right away.",
  },
];

const FAQS = [
  { q: "When will I be charged?", a: "You're charged immediately when you subscribe. For monthly plans, you're billed on the same day each month. For yearly plans, you're billed once upfront for the full year." },
  { q: "Can I switch plans mid-cycle?", a: "Yes. Upgrading is prorated — you only pay the difference for the remaining days. Downgrading takes effect at the end of your current billing cycle." },
  { q: "What happens when I hit the free limit?", a: "On the Free plan, reviews are paused once you hit 10/month. Existing connected repos stay connected — you just won't receive new reviews until the next calendar month or until you upgrade." },
  { q: "Do you offer refunds?", a: "We offer a 7-day money-back guarantee on Pro and Team plans. If you're not satisfied, contact us within 7 days of payment for a full refund." },
  { q: "Are there discounts for open source?", a: "Yes — maintainers of public repos with 100+ stars can apply for a free Pro account. Email us at hi@prreview.ai with your GitHub profile." },
  { q: "How does team billing work?", a: "The Team plan includes 5 seats. Additional seats are $8/month each. All seats share one subscription managed by the account owner." },
];

// ── Components ───────────────────────────────────────────────────────────────

function FAQItem({ faq, index }: { faq: typeof FAQS[0]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/6">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 py-4 text-left group"
      >
        <span className={cn("text-[13px] sm:text-[14px] font-medium transition-colors leading-snug",
          open ? "text-green-400" : "text-white/70 group-hover:text-white")}>
          {faq.q}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-white/25 flex-shrink-0 transition-transform duration-300", open && "rotate-180")} />
      </button>
      <div className={cn("overflow-hidden transition-all duration-300", open ? "max-h-40 pb-4" : "max-h-0")}>
        <p className="text-[13px] text-white/40 leading-relaxed">{faq.a}</p>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const currentPlan = "free"; // Replace with actual user plan

  return (
    <div className="min-h-screen bg-black">
      <div className="pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto">

          {/* ── Header ── */}
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-400/10 border border-green-400/20 mb-4">
              <Sparkles className="h-3.5 w-3.5 text-green-400" />
              <span className="text-[12px] font-semibold text-green-400">You are on the Free plan</span>
            </div>
            <h1 className="text-[32px] sm:text-[48px] font-black text-white tracking-tight leading-tight mb-3">
              Simple, honest pricing
            </h1>
            <p className="text-white/40 text-[15px] sm:text-[17px] max-w-[480px] mx-auto leading-relaxed">
              Start free. Pay only when you ship more. No surprise charges.
            </p>
          </div>

          {/* ── Billing toggle ── */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <span className={cn("text-[14px] transition-colors", !isYearly ? "text-white" : "text-white/35")}>Monthly</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={cn("relative w-11 h-6 rounded-full border transition-all duration-300",
                isYearly ? "bg-green-400/20 border-green-400/40" : "bg-white/8 border-white/12")}
            >
              <div className={cn("absolute top-[3px] w-[18px] h-[18px] rounded-full transition-all duration-300",
                isYearly ? "left-[23px] bg-green-400" : "left-[3px] bg-white/40")} />
            </button>
            <span className={cn("text-[14px] transition-colors flex items-center gap-2", isYearly ? "text-white" : "text-white/35")}>
              Yearly
              <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">
                Save 20%
              </span>
            </span>
          </div>

          {/* ── Plan cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16 max-w-[400px] sm:max-w-none mx-auto">
            {PLANS.map((plan) => {
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
              const isCurrent = plan.id === currentPlan;
              const isFeatured = plan.id === "pro";

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative rounded-2xl p-6 sm:p-7 flex flex-col border transition-all duration-300",
                    isFeatured
                      ? "bg-green-400/[0.04] border-green-400/25 sm:scale-[1.03] shadow-lg shadow-green-500/10"
                      : "bg-white/[0.03] border-white/8 hover:border-white/16 hover:bg-white/[0.05]"
                  )}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-wider uppercase bg-green-400 text-black px-4 py-1 rounded-full whitespace-nowrap">
                      {plan.badge}
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-wider uppercase bg-white/10 text-white/60 border border-white/15 px-4 py-1 rounded-full whitespace-nowrap">
                      Current
                    </div>
                  )}

                  {/* Plan header */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", plan.iconBg)}>
                      <plan.icon className={cn("h-4 w-4", plan.iconColor)} />
                    </div>
                    <span className="text-[14px] font-bold text-white/60">{plan.name}</span>
                  </div>

                  {/* Price */}
                  <div className="mb-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[42px] font-black text-white leading-none">${price}</span>
                      {price > 0 && <span className="text-[14px] text-white/30">/mo</span>}
                    </div>
                    {price === 0 && <div className="text-[12px] text-white/25 mt-0.5">free forever</div>}
                    {isYearly && price > 0 && (
                      <div className="text-[11px] text-green-400/70 mt-0.5">
                        ${price * 12}/yr · Save ${(plan.monthlyPrice - plan.yearlyPrice) * 12}
                      </div>
                    )}
                    {!isYearly && price > 0 && (
                      <div className="text-[11px] text-white/25 mt-0.5">billed monthly</div>
                    )}
                  </div>

                  <p className="text-[13px] text-white/35 mb-5 leading-relaxed">{plan.description}</p>

                  {/* CTA */}
                  {plan.ctaVariant === "current" ? (
                    <div className="w-full text-center py-2.5 rounded-xl text-[13px] font-semibold mb-5 bg-white/5 text-white/30 border border-white/8 cursor-default">
                      ✓ Current plan
                    </div>
                  ) : (
                    <Link
                      href={plan.ctaHref}
                      className={cn(
                        "w-full text-center py-2.5 rounded-xl text-[14px] font-semibold mb-5 block transition-all duration-200",
                        plan.ctaVariant === "primary"
                          ? "bg-green-400 text-black hover:bg-green-300 shadow-lg shadow-green-500/20"
                          : "bg-white/8 text-white border border-white/12 hover:bg-white/14"
                      )}
                    >
                      {plan.cta}
                    </Link>
                  )}

                  <div className="h-px bg-white/6 mb-4" />

                  {/* Features */}
                  <div className="flex flex-col gap-2.5 flex-1">
                    {plan.features.map((feat) => (
                      <div key={feat.text} className={cn("flex items-center gap-2.5", !feat.included && "opacity-35")}>
                        {feat.included
                          ? <Check className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                          : <X className="h-3.5 w-3.5 text-white/30 flex-shrink-0" />
                        }
                        <span className="text-[12px] sm:text-[13px] text-white/65">{feat.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Payment & trust section ── */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-[22px] sm:text-[28px] font-black text-white mb-2">Payment & security</h2>
              <p className="text-white/40 text-[14px]">Everything you need to know before subscribing.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PAYMENT_FEATURES.map((f) => (
                <div key={f.title} className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/14 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-green-400/10 border border-green-400/20 flex items-center justify-center flex-shrink-0">
                    <f.icon className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-white mb-1">{f.title}</h3>
                    <p className="text-[12px] sm:text-[13px] text-white/40 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Polar badge */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/6">
              <div className="flex items-center gap-2 text-[13px] text-white/40">
                <Lock className="h-4 w-4 text-green-400" />
                Payments secured by
                <a href="https://polar.sh" target="_blank" rel="noopener noreferrer"
                  className="text-white hover:text-green-400 transition-colors font-semibold flex items-center gap-1">
                  Polar.sh <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <span className="hidden sm:block text-white/15">·</span>
              <div className="flex items-center gap-3 text-[12px] text-white/25">
                <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> PCI-DSS</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> TLS 1.3</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" /> SOC 2</span>
              </div>
            </div>
          </div>

          {/* ── Usage comparison table ── */}
          <div className="mb-16 overflow-x-auto">
            <h2 className="text-[22px] sm:text-[28px] font-black text-white mb-6 text-center">Compare plans</h2>
            <table className="w-full border-collapse min-w-[560px]">
              <thead>
                <tr>
                  <th className="text-left text-[12px] text-white/25 font-semibold pb-4 pr-4 w-[40%]">Feature</th>
                  {PLANS.map((p) => (
                    <th key={p.id} className={cn("text-center text-[13px] font-bold pb-4 px-2",
                      p.id === currentPlan ? "text-white/40" : p.id === "pro" ? "text-green-400" : "text-white/60")}>
                      {p.name}
                      {p.id === currentPlan && <span className="ml-1 text-[10px] text-white/25">(you)</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "PR reviews / month",  free: "10",       pro: "Unlimited", team: "Unlimited" },
                  { label: "Repositories",         free: "1",        pro: "Unlimited", team: "Unlimited" },
                  { label: "Review history",       free: "7 days",   pro: "90 days",   team: "Unlimited" },
                  { label: "Priority queue",       free: false,      pro: true,        team: true        },
                  { label: "Analytics",            free: false,      pro: true,        team: true        },
                  { label: "Custom rules",         free: false,      pro: false,       team: true        },
                  { label: "SAML SSO",             free: false,      pro: false,       team: true        },
                  { label: "Team seats",           free: "—",        pro: "1",         team: "5 + $8/ea" },
                  { label: "Support",              free: "Email",    pro: "Priority",  team: "Slack SLA" },
                ].map((row) => (
                  <tr key={row.label} className="border-t border-white/5">
                    <td className="py-3 text-[13px] text-white/50 pr-4">{row.label}</td>
                    {[row.free, row.pro, row.team].map((val, i) => (
                      <td key={i} className="py-3 text-center px-2">
                        {typeof val === "boolean"
                          ? val
                            ? <Check className="h-4 w-4 text-green-400 mx-auto" />
                            : <X className="h-4 w-4 text-white/15 mx-auto" />
                          : <span className="text-[13px] text-white/50">{val}</span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── FAQ ── */}
          <div className="mb-16 max-w-[680px] mx-auto">
            <h2 className="text-[22px] sm:text-[28px] font-black text-white mb-6 text-center">Billing FAQ</h2>
            {FAQS.map((faq, i) => <FAQItem key={faq.q} faq={faq} index={i} />)}
          </div>

          {/* ── Enterprise CTA ── */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-violet-400/10 border border-violet-400/20 flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-6 w-6 text-violet-400" />
            </div>
            <h3 className="text-[20px] font-black text-white mb-2">Need Enterprise?</h3>
            <p className="text-white/40 text-[14px] max-w-[380px] mx-auto mb-5 leading-relaxed">
              Custom seats, dedicated infra, on-premise deployment, and compliance packages. Let&apos;s talk.
            </p>
            <a href="mailto:enterprise@prreview.ai"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-400/10 border border-violet-400/20 text-violet-400 text-[13px] font-semibold hover:bg-violet-400/20 transition-colors">
              Contact us <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}