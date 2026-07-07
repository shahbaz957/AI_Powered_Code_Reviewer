import Link from "next/link";
import { GitPullRequest } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
          <GitPullRequest className="h-8 w-8 text-white/20" />
        </div>
        <h1 className="text-[72px] font-black text-white/10 leading-none mb-2">
          404
        </h1>
        <h2 className="text-[22px] font-bold text-white mb-2">
          Page not found
        </h2>
        <p className="text-[14px] text-white/40 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl text-[13px] font-semibold bg-green-400 text-black hover:bg-green-300 transition-all"
          >
            Go home
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white/60 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
