"use client";

import { useEffect, useRef, useState } from "react";
import { compactNumber, indianNumber } from "@/lib/format";

// Format keys are serializable, so a Server Component can pick one without
// passing a function across the RSC boundary (functions aren't serializable).
export type FormatKey = "number" | "compact" | "fixed1";

const FORMATTERS: Record<FormatKey, (n: number) => string> = {
  number: (n) => indianNumber(n),
  compact: (n) => compactNumber(n),
  fixed1: (n) => n.toFixed(1),
};

// Renders the FINAL value by default (SSR-correct, screenshot-safe, and the
// guaranteed end state). Animates 0 → value purely as an enhancement when the
// element scrolls into view. If the observer/rAF never fire, the number is
// simply already correct, correctness never depends on the animation.
export default function CountUp({
  value,
  format = "number",
  durationMs = 1600,
  className = "",
}: {
  value: number;
  format?: FormatKey;
  durationMs?: number;
  className?: string;
}) {
  const fmt = FORMATTERS[format] ?? FORMATTERS.number;
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || typeof IntersectionObserver === "undefined") return; // keep final

    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let safety: ReturnType<typeof setTimeout>;

    const animate = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        setDisplay(value * eased);
        if (t < 1) raf = requestAnimationFrame(tick);
        else setDisplay(value);
      };
      raf = requestAnimationFrame(tick);
      // belt-and-suspenders: land the final value even if rAF is throttled
      safety = setTimeout(() => setDisplay(value), durationMs + 80);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started.current) {
          started.current = true;
          io.disconnect();
          animate();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(safety);
    };
  }, [value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {fmt(display)}
    </span>
  );
}
