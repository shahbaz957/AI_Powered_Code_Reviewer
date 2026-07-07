"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-400/10 border border-red-400/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-[24px] font-bold text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-[14px] text-white/40 mb-6 leading-relaxed">
          An unexpected error occurred. This has been logged and we&apos;ll look into it.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-green-400 text-black hover:bg-green-300 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white/60 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            Go home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-[11px] text-white/15 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
