import { Navbar }               from "@/components/layout/Navbar";
import { FlowCanvas }            from "@/components/ui/FlowCanvas";
import { HeroSection }           from "@/components/sections/HeroSection";
import { IntegrationsSection }   from "@/components/sections/IntegrationsSection";
import { FeaturesSection }       from "@/components/sections/FeaturesSection";
import { HowItWorksSection }     from "@/components/sections/HowItWorksSection";
import { AppPreviewSection }     from "@/components/sections/AppPreviewSection";
import { PricingSection }        from "@/components/sections/PricingSection";
import { FAQSection }            from "@/components/sections/FAQSection";
import { CTASection, Footer }    from "@/components/sections/CTASection";

/**
 * Swap `isAuthenticated` to `true` when reading a real
 * BetterAuth session server-side. When true the navbar
 * shows "Dashboard" instead of "Home".
 */
const isAuthenticated = false;

export default function HomePage() {
  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} />

      <main>
        {/* 1. Hero — centered giant title + avatar stack */}
        <HeroSection />

        {/* 2. Integration logos with bezier flow lines */}
        <IntegrationsSection />

        {/* 3. Bento grid features */}
        <FeaturesSection />

        {/* 4. Problem → Solution + 4-step mini-cards */}
        <HowItWorksSection />

        {/* 5. macOS window dashboard preview */}
        <AppPreviewSection />

        {/* 6. Pricing with toggle */}
        <PricingSection />

        {/* 7. FAQ accordion */}
        <FAQSection />

        {/* 8. Bottom CTA */}
        <CTASection />
      </main>

      <Footer />
    </>
  );
}