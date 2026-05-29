import { Star } from "lucide-react";
import type { Insight } from "@/lib/types";
import InsightCard from "./InsightCard";

// Featured card, rotates deterministically by UTC day (SSG-stable). §6.5
export default function InsightOfTheDay({ insight }: { insight: Insight }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <div className="mb-3 flex items-center gap-2">
        <Star size={16} className="fill-gold text-gold" />
        <h2 className="meta-label text-maroon">Insight of the Day</h2>
      </div>
      <div className="max-w-3xl">
        <InsightCard insight={insight} featured />
      </div>
    </section>
  );
}
