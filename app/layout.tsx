import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "PRReview.ai — AI-powered code reviews",
    template: "%s · PRReview.ai",
  },
  description:
    "Automated AI code reviews on every pull request. Powered by Groq, delivered as native GitHub comments in ~30 seconds.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://prreview.ai"
  ),
  openGraph: {
    type: "website",
    siteName: "PRReview.ai",
    title: "PRReview.ai — AI-powered code reviews",
    description:
      "Connect your GitHub repo. Every PR gets an instant AI review posted as inline GitHub comments.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PRReview.ai",
    description: "AI code reviews on every pull request.",
  },
  robots: { index: true, follow: true },
  // Favicon comes from app/icon.png (App Router file convention).
  // That overrides metadata.icons — keep the file in /app, not only /public.
};

export const viewport: Viewport = {
  themeColor: [{ color: "#020617" }],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}