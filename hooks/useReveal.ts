"use client";

import { useState, useCallback } from "react";
export function useReveal(threshold = 0.12) {
  const [visible, setVisible] = useState(false);

  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        },
        { threshold }
      );
      io.observe(node);
    },
    [threshold]
  );

  return { ref, visible };
}