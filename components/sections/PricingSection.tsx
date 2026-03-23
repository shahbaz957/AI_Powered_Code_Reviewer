"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { plans } from "@/constants/pricing";


export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const { ref, visible } = useReveal(0.1);

  return (
    <section id="pricing" className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-green-400/20 to-transparent" />

      <div className="max-w-[1160px] mx-auto">
        {/* Header */}
        <div ref={ref} className={cn("text-center mb-8 sm:mb-10 transition-all duration-700", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5")}>
          <div className="section-label justify-center">Pricing</div>
          <h2 className="text-white mb-3">Start free, scale as you grow</h2>
          <p className="text-white/50 text-[15px] sm:text-[16px] max-w-[400px] mx-auto leading-relaxed">
            No credit card required to get started.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
          <span className={cn("text-[13px] sm:text-[14px] transition-colors", !isYearly ? "text-white" : "text-white/35")}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={cn("relative w-10 sm:w-11 h-6 rounded-full border transition-all duration-300", isYearly ? "bg-green-400/20 border-green-400/40" : "bg-white/8 border-white/12")}
          >
            <div className={cn("absolute top-[3px] w-[18px] h-[18px] rounded-full transition-all duration-300", isYearly ? "left-[19px] sm:left-[23px] bg-green-400" : "left-[3px] bg-white/40")} />
          </button>
          <span className={cn("text-[13px] sm:text-[14px] transition-colors flex items-center gap-2", isYearly ? "text-white" : "text-white/35")}>
            Yearly
            <span className="text-[10px] sm:text-[11px] font-semibold text-green-400 bg-green-400/10 px-1.5 sm:px-2 py-0.5 rounded-full">Save 20%</span>
          </span>
        </div>

        {/* Cards — 1 col mobile, 3 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-[360px] sm:max-w-none mx-auto">
          {plans.map((plan, i) => (
            <PriceCard key={plan.name} plan={plan} isYearly={isYearly} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PriceCard({ plan, isYearly, delay }: { plan: typeof plans[0]; isYearly: boolean; delay: number }) {
  const { ref, visible } = useReveal(0.1);
  const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;

  return (
    <div
      ref={ref}
      className={cn(
        "relative rounded-[20px] p-6 sm:p-7 flex flex-col border transition-all duration-700",
        plan.featured ? "bg-green-400/[0.04] border-green-400/20 sm:scale-[1.02]" : "bg-white/[0.03] border-white/8 hover:border-white/14 hover:bg-white/[0.05]",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-widest uppercase bg-green-400 text-black px-4 py-1 rounded-full whitespace-nowrap">
          {plan.badge}
        </div>
      )}

      <div className="text-[13px] font-semibold text-white/40 mb-3 sm:mb-4 mt-1">{plan.name}</div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-[36px] sm:text-[40px] font-black text-white leading-none tracking-tight">${price}</span>
      </div>
      <div className="text-[12px] text-white/30 mb-2">
        {isYearly && price > 0 ? "per month · billed yearly" : price === 0 ? "forever free" : "per month"}
      </div>
      {isYearly && plan.yearlyPrice > 0 && (
        <div className="text-[11px] text-green-400 mb-2">Save ${(plan.monthlyPrice - plan.yearlyPrice) * 12}/yr</div>
      )}
      <div className="text-[13px] text-white/40 mb-5 sm:mb-6 leading-relaxed">{plan.description}</div>

      <Link
        href={plan.ctaHref}
        className={cn(
          "w-full text-center py-2.5 rounded-xl text-[14px] font-semibold mb-5 sm:mb-6 block transition-all duration-200",
          plan.ctaStyle === "primary"
            ? "bg-green-400 text-black hover:bg-green-300 shadow-lg shadow-green-500/25"
            : "bg-white/8 text-white border border-white/12 hover:bg-white/14"
        )}
      >
        {plan.cta}
      </Link>

      <div className="h-px bg-white/6 mb-4 sm:mb-5" />

      <div className="flex flex-col gap-2 sm:gap-2.5 flex-1">
        {plan.features.map((feat) => (
          <div key={feat} className="flex items-center gap-2 sm:gap-2.5">
            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
            <span className="text-[12px] sm:text-[13px] text-white/65">{feat}</span>
          </div>
        ))}
        {plan.missing.map((feat) => (
          <div key={feat} className="flex items-center gap-2 sm:gap-2.5 opacity-30">
            <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex items-center justify-center flex-shrink-0">
              <div className="h-px w-3 bg-white/40" />
            </div>
            <span className="text-[12px] sm:text-[13px] text-white/40">{feat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}