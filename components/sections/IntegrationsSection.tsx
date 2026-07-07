"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Github, GitPullRequest, FileCode2, Bot, MessageSquare, Mail } from "lucide-react";

/*
  Layout (all positions as fraction of a capped 700px wide zone centered in viewport):

  LEFT              CENTER          RIGHT
  GitHub  ────────→  [PR]  ───────→ Fetch PR   (top)
                           ───────→ AI Review  (mid)
                           ───────→ PR Comment (bottom)
                           ───────→ Email      (below center)
*/

const MAX_SPREAD = 700; // max diagram width in px — prevents over-stretching on large screens

export function IntegrationsSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const frameRef  = useRef<number>(0);
  const timeRef   = useRef<number>(0);
  const posRef    = useRef<Record<string, [number, number]>>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const buildPositions = (W: number, H: number) => {
      // Cap the spread and center it
      const spread = Math.min(W, MAX_SPREAD);
      const ox     = (W - spread) / 2; // left offset to center the zone

      posRef.current = {
        github:  [ox + spread * 0.06, H * 0.50],
        pr:      [ox + spread * 0.40, H * 0.50],
        fetch:   [ox + spread * 0.82, H * 0.18],
        ai:      [ox + spread * 0.82, H * 0.50],
        comment: [ox + spread * 0.82, H * 0.82],
        email:   [ox + spread * 0.52, H * 0.88],
      };
    };

    const resize = () => {
      canvas.width  = wrap.offsetWidth;
      canvas.height = wrap.offsetHeight;
      buildPositions(canvas.width, canvas.height);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const CONNECTIONS: [string, string, string][] = [
      ["github",  "pr",      "rgba(0,230,118,"],
      ["pr",      "fetch",   "rgba(34,211,238,"],
      ["pr",      "ai",      "rgba(167,139,250,"],
      ["pr",      "comment", "rgba(0,230,118,"],
      ["pr",      "email",   "rgba(251,191,36,"],
    ];

    const drawCurve = (
      sx: number, sy: number,
      ex: number, ey: number,
      color: string, alpha: number,
      t: number
    ) => {
      const dx   = ex - sx;
      const cp1x = sx + dx * 0.45;
      const cp2x = sx + dx * 0.55;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(cp1x, sy, cp2x, ey, ex, ey);
      ctx.strokeStyle = color + alpha + ")";
      ctx.lineWidth   = 1.2;
      ctx.stroke();

      const bx = (1-t)**3*sx + 3*(1-t)**2*t*cp1x + 3*(1-t)*t**2*cp2x + t**3*ex;
      const by = (1-t)**3*sy + 3*(1-t)**2*t*sy   + 3*(1-t)*t**2*ey   + t**3*ey;

      ctx.beginPath();
      ctx.arc(bx, by, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = color + "0.95)";
      ctx.fill();
    };

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const pos = posRef.current;
      if (!pos.github) { frameRef.current = requestAnimationFrame(draw); return; }

      CONNECTIONS.forEach(([from, to, color], i) => {
        const [sx, sy] = pos[from];
        const [ex, ey] = pos[to];
        const alpha    = 0.20 + 0.08 * Math.sin(timeRef.current * 0.5 + i * 1.1);
        const progress = ((timeRef.current * 0.35 + i * 0.65) % 1 + 1) % 1;
        drawCurve(sx, sy, ex, ey, color, alpha, progress);
      });

      timeRef.current += 0.010;
      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(frameRef.current); ro.disconnect(); };
  }, []);

  /*
    CSS positioning mirrors buildPositions fractions.
    We use the same MAX_SPREAD cap via inline style with clamp().
    
    The diagram zone is: min(100%, 700px) centered.
    Each chip is positioned within that zone using left/right
    relative to the centering offset.

    Formula:
      left chip  → left:  calc(50% - (MAX_SPREAD/2)px + (fraction * MAX_SPREAD)px)
      right chips → placed symmetrically
  */

  const Z  = MAX_SPREAD; // 700
  const cx = `calc(50% - min(${Z / 2}px, 46vw))`; // left edge of diagram zone

  // Precomputed positions matching buildPositions fractions
  const githubLeft   = `calc(45% - min(${Z/2}px, 46vw) + min(${Z * 0.06}px, 5.5vw))`;
const prLeft       = `calc(50% - min(${Z/2}px, 46vw) + min(${Z * 0.40}px, 36.8vw) - 28px)`;
const fetchLeft    = `calc(48% - min(${Z/2}px, 46vw) + min(${Z * 0.82}px, 75.4vw) - 10px)`;
const aiLeft       = `calc(48% - min(${Z/2}px, 46vw) + min(${Z * 0.82}px, 75.4vw) - 10px)`;
const commentLeft  = `calc(48% - min(${Z/2}px, 46vw) + min(${Z * 0.82}px, 75.4vw) - 10px)`;
const emailLeft    = `calc(50% - min(${Z/2}px, 46vw) + min(${Z * 0.52}px, 47.8vw) - 75px)`;

  return (
    <section
      className="relative z-10 overflow-hidden w-full"
      style={{ height: "clamp(360px, 50vw, 480px)" }}
    >
      <div ref={wrapRef} className="relative w-full h-full">

        {/* Animated canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" aria-hidden />

        {/* GitHub — left */}
        <div className="absolute z-10" style={{ left: githubLeft, top: "calc(50% - 22px)" }}>
          <Chip label="GitHub" sublabel="Source repo" Icon={Github} iconBg="bg-[#24292e]" iconColor="text-white" />
        </div>

        {/* PR — center hub */}
        <div className="absolute z-10" style={{ left: prLeft, top: "calc(50% - 28px)" }}>
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-green-400/30 blur-lg" />
            <div className="relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-cyan-500 shadow-xl shadow-green-500/40">
              <GitPullRequest className="h-5 w-5 text-black" strokeWidth={2.5} />
              <span className="text-[9px] font-black text-black leading-none mt-0.5">PR</span>
            </div>
          </div>
        </div>

        {/* Fetch PR — right top */}
        <div className="absolute z-10" style={{ left: fetchLeft, top: "calc(18% - 22px)" }}>
          <Chip label="Fetch PR" sublabel="Octokit · diff" Icon={FileCode2} iconBg="bg-[#6366f1]" iconColor="text-white" />
        </div>

        {/* AI Review — right mid */}
        <div className="absolute z-10" style={{ left: aiLeft, top: "calc(50% - 22px)" }}>
          <Chip label="AI Review" sublabel="Claude analyzes" Icon={Bot} iconBg="bg-[#0c344b]" iconColor="text-cyan-400" />
        </div>

        {/* PR Comment — right bottom */}
        <div className="absolute z-10" style={{ left: commentLeft, top: "calc(82% - 22px)" }}>
          <Chip label="PR Comment" sublabel="Posted on GitHub" Icon={MessageSquare} iconBg="bg-[#0a2a0a]" iconColor="text-green-400" />
        </div>

        {/* Email — bottom center of diagram */}
        <div className="absolute z-10" style={{ left: emailLeft, top: "calc(88% - 22px)" }}>
          <Chip label="Email summary" sublabel="Sent to repo owner" Icon={Mail} iconBg="bg-[#2a1a00]" iconColor="text-amber-400" highlight="border-amber-400/25" />
        </div>

      </div>
    </section>
  );
}

function Chip({
  label,
  sublabel,
  Icon,
  iconBg,
  iconColor,
  highlight,
}: {
  label: string;
  sublabel: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  highlight?: string;
}) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-2.5 py-2 rounded-2xl border border-white/10 bg-[rgba(10,10,13,0.92)] backdrop-blur-md shadow-lg shadow-black/40",
      highlight
    )}>
      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
        <Icon className={cn("h-4 w-4", iconColor)} />
      </div>
      <div>
        <p className="text-[12px] font-semibold text-white leading-none whitespace-nowrap">{label}</p>
        <p className="text-[10px] text-white/40 mt-0.5 whitespace-nowrap hidden md:block">{sublabel}</p>
      </div>
    </div>
  );
}