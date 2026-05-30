"use client";

import { Sparkles, Star } from "lucide-react";
import { useCallback, useState } from "react";
import type { Insight } from "@/lib/types";
import InsightCard from "./InsightCard";

// Featured card. Default = deterministic day-pick so the initial paint is the
// same for everyone (SSG-stable + good for share previews). "Surprise me"
// swaps it in-place to a fresh random insight, no navigation. State stays
// local so refreshing the page goes back to the day pick.
//
// The label flips from "Insight of the Day" to "Random pick" after a swap so
// the URL doesn't lie about what's being shown.
export default function InsightOfTheDay({
  initial,
  all,
}: {
  initial: Insight;
  all: Insight[];
}) {
  const [current, setCurrent] = useState<Insight>(initial);
  const isRandom = current.id !== initial.id;

  const surprise = useCallback(() => {
    if (all.length <= 1) return;
    let pick = all[Math.floor(Math.random() * all.length)];
    // re-roll up to 3x to avoid showing the same insight twice in a row
    for (let i = 0; i < 3 && pick.id === current.id; i++) {
      pick = all[Math.floor(Math.random() * all.length)];
    }
    setCurrent(pick);
  }, [all, current.id]);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          {isRandom ? (
            <Sparkles size={16} className="text-gold" />
          ) : (
            <Star size={16} className="fill-gold text-gold" />
          )}
          <h2 className="meta-label text-maroon">
            {isRandom ? "Random pick" : "Insight of the Day"}
          </h2>
        </div>

        <button
          type="button"
          onClick={surprise}
          aria-label="Show me a different random lesson"
          className="group ml-auto inline-flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-[0.78rem] font-semibold text-maroon-deep shadow-sm transition hover:brightness-95 focus-visible:ring-brand"
        >
          <Sparkles size={13} className="transition-transform group-hover:rotate-12" />
          {isRandom ? "Surprise me again" : "Surprise me"}
        </button>
      </div>

      <div key={current.id} className="max-w-3xl animate-fade-up">
        <InsightCard insight={current} featured />
      </div>
    </section>
  );
}
