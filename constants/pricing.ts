export const plans = [
  {
    name: "Free", monthlyPrice: 0, yearlyPrice: 0,
    description: "For solo developers and open source projects.",
    cta: "Start for free", ctaHref: "/sign-up", ctaStyle: "ghost", featured: false,
    features: ["10 PR reviews / month", "1 repository", "GitHub inline comments", "Security scanning", "7-day review history"],
    missing: ["Priority queue", "Analytics dashboard", "Custom rules"],
  },
  {
    name: "Pro", monthlyPrice: 15, yearlyPrice: 14,
    description: "For developers and teams who ship continuously.",
    cta: "Get Pro", ctaHref: "/sign-up?plan=pro", ctaStyle: "primary", featured: true, badge: "Most popular",
    features: ["Unlimited PR reviews", "Unlimited repositories", "GitHub inline comments", "Security + perf scan", "Priority review queue", "90-day review history", "Analytics dashboard"],
    missing: ["Custom rules", "SAML SSO"],
  },
  {
    name: "Team", monthlyPrice: 49, yearlyPrice: 39,
    description: "For engineering teams with compliance needs.",
    cta: "Get Team", ctaHref: "/sign-up?plan=team", ctaStyle: "ghost", featured: false,
    features: ["Everything in Pro", "5 team seats", "Custom review rules", "SAML SSO", "Audit log", "Unlimited history", "Dedicated Slack support"],
    missing: [],
  },
];