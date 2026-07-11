"use client";

import { useEffect, useRef } from "react";

interface UsePollingOptions {
  /** Called on each tick. Return false to skip this tick. */
  enabled?: boolean;
  /** Ms between polls. */
  intervalMs: number;
  /** Pause while the tab is hidden (default true). */
  pauseWhenHidden?: boolean;
  /** Fire immediately when enabled becomes true. */
  immediate?: boolean;
}

/**
 * Lightweight interval polling with visibility awareness.
 * Used by dashboard/review pages to refresh in-progress PR reviews.
 */
export function usePolling(
  callback: () => void | Promise<void>,
  {
    enabled = true,
    intervalMs,
    pauseWhenHidden = true,
    immediate = false,
  }: UsePollingOptions,
) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      if (pauseWhenHidden && document.hidden) return;
      void savedCallback.current();
    };

    if (immediate) tick();

    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, intervalMs, pauseWhenHidden, immediate]);
}
