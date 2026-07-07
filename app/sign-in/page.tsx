"use client"

import { authClient } from "@/lib/auth-client"
import { GitPullRequest, Github } from "lucide-react"

export default function SignInPage() {
  const handleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      })
    } catch (err) {
      console.error("Sign-in failed:", err)
      alert(
        "Sign-in failed. Check that the dev server and database are running, and that your GitHub OAuth callback URL matches how you're accessing the app (localhost vs ngrok).",
      )
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-x-0 top-1/3 h-[400px] bg-radial-green pointer-events-none" />

      <div className="relative w-full max-w-[400px]">
        <div className="glass rounded-2xl border border-white/10 p-8">

          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-cyan-500">
              <GitPullRequest className="h-5 w-5 text-black" strokeWidth={2.5} />
            </div>
            <span className="text-[16px] font-semibold text-white">
              PRReview<span className="text-green-400">.ai</span>
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-[24px] font-bold text-white text-center mb-2">
            Welcome back
          </h1>
          <p className="text-[14px] text-white/40 text-center mb-8 leading-relaxed">
            Sign in to start reviewing your PRs automatically.
            <br />
            New here? Your account is created automatically.
          </p>

          {/* GitHub button */}
          <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#24292e] hover:bg-[#2f363d] border border-white/10 text-white text-[14px] font-semibold transition-all duration-200"
          >
            <Github className="h-5 w-5" />
            Continue with GitHub
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[11px] text-white/25">secure OAuth — no password needed</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Trust badges */}
          <div className="flex justify-center gap-6">
            {["No password", "GitHub native", "Cancel anytime"].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-[11px] text-white/30">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}