"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="h-7 w-7 text-amber-400" />
        </div>
        <h2 className="text-[22px] font-bold text-white mb-2">
          Dashboard Error
        </h2>
        <p className="text-[14px] text-white/40 mb-6">
          Something went wrong loading your dashboard. Please try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-green-400 text-black hover:bg-green-300 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white/60 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
