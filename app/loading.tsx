import { RefreshCw } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="h-6 w-6 text-green-400/50 animate-spin mx-auto mb-3" />
        <p className="text-[13px] text-white/30">Loading…</p>
      </div>
    </div>
  );
}
