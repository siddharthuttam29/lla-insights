"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { insights } from "@/lib/data";

// "Surprise me" picks a random insight from the in-memory array (which is
// already shipped client-side for search) and client-navigates to it. No extra
// bundle cost, no server round trip.
//
// State note: we keep a single "last id" so the same insight never fires twice
// in a row (people press the button repeatedly; identical results feel broken).

type Variant = "hero" | "compact";

export default function SurpriseButton({ variant = "hero" }: { variant?: Variant }) {
  const router = useRouter();
  const [lastId, setLastId] = useState<string | null>(null);

  const onClick = useCallback(() => {
    if (insights.length === 0) return;
    let pick = insights[Math.floor(Math.random() * insights.length)];
    // re-roll up to 3x if we hit the previous pick (avoid same-id repeats)
    for (let i = 0; i < 3 && pick.id === lastId && insights.length > 1; i++) {
      pick = insights[Math.floor(Math.random() * insights.length)];
    }
    setLastId(pick.id);
    router.push(`/insight/${pick.id}?from=surprise`);
  }, [router, lastId]);

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Show me a random lesson"
        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-[0.78rem] font-semibold text-ink transition hover:border-maroon/40 hover:text-maroon focus-visible:ring-brand"
      >
        <Sparkles size={14} className="text-gold" />
        Surprise me
      </button>
    );
  }

  // hero variant: gold pill that pops against the maroon background
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Show me a random money lesson"
      className="group inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-maroon-deep shadow-card transition hover:brightness-95 hover:shadow-card-hover focus-visible:ring-brand"
    >
      <Sparkles size={15} className="transition-transform group-hover:rotate-12" />
      Surprise me with a lesson
    </button>
  );
}
