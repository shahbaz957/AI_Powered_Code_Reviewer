"use client";

import { useEffect, useRef } from "react";

interface FlowLine {
  yRatio: number;
  amp: number;
  freq: number;
  speed: number;
  phase: number;
  color: string;
  width: number;
}

const LINES: FlowLine[] = [
  { yRatio: 0.22, amp: 55, freq: 0.0008, speed: 0.35, phase: 0.0, color: "rgba(34,211,238,",  width: 1.2 },
  { yRatio: 0.34, amp: 40, freq: 0.0010, speed: 0.45, phase: 1.4, color: "rgba(34,211,238,",  width: 0.9 },
  { yRatio: 0.48, amp: 75, freq: 0.0007, speed: 0.28, phase: 2.2, color: "rgba(0,230,118,",   width: 1.4 },
  { yRatio: 0.56, amp: 45, freq: 0.0009, speed: 0.50, phase: 0.7, color: "rgba(0,230,118,",   width: 1.0 },
  { yRatio: 0.67, amp: 30, freq: 0.0011, speed: 0.38, phase: 1.8, color: "rgba(34,211,238,",  width: 0.8 },
  { yRatio: 0.78, amp: 55, freq: 0.0008, speed: 0.42, phase: 3.1, color: "rgba(0,230,118,",   width: 1.1 },
  { yRatio: 0.88, amp: 25, freq: 0.0012, speed: 0.30, phase: 0.5, color: "rgba(167,139,250,", width: 0.7 },
];

export function FlowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef<number>(0);
  const timeRef   = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* Resize handler */
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    /* Draw loop */
    const draw = () => {
      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);

      LINES.forEach((line, i) => {
        const baseY = H * line.yRatio;
        ctx.beginPath();

        for (let x = 0; x <= W; x += 4) {
          const t = timeRef.current;
          const y =
            baseY +
            Math.sin(x * line.freq + t * line.speed + line.phase) * line.amp +
            Math.sin(x * line.freq * 2.1 + t * line.speed * 0.7 + line.phase + 1.3) * line.amp * 0.38 +
            Math.cos(x * line.freq * 0.6 + t * line.speed * 1.3 + line.phase + 2.1) * line.amp * 0.22;

          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }

        /* Opacity breathes slowly */
        const alpha = 0.14 + 0.07 * Math.sin(timeRef.current * 0.5 + i * 0.9);
        ctx.strokeStyle = line.color + alpha + ")";
        ctx.lineWidth   = line.width;
        ctx.stroke();
      });

      timeRef.current += 0.012;
      frameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.55 }}
      aria-hidden="true"
    />
  );
}