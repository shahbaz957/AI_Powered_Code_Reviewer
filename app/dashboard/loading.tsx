import { RefreshCw } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="pt-28 pb-16 px-4 sm:px-6 max-w-[1080px] mx-auto">
        {/* Greeting skeleton */}
        <div className="mb-8 sm:mb-10">
          <div className="h-4 w-32 bg-white/5 rounded-md mb-2 animate-pulse" />
          <div className="h-10 w-64 bg-white/5 rounded-xl mb-2 animate-pulse" />
          <div className="h-4 w-48 bg-white/5 rounded-md animate-pulse" />
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 animate-pulse h-28" />
          ))}
        </div>

        {/* Table skeleton */}
        <div className="rounded-2xl bg-[rgba(8,8,12,0.6)] border border-white/8 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/6 bg-white/[0.015]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 text-center">
              <div className="h-3 w-40 bg-white/5 rounded mx-auto animate-pulse" />
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-5 w-5 text-white/20 animate-spin" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
