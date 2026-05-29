import type { Insight } from "@/lib/types";
import InsightCard from "./InsightCard";

// Flat responsive grid of InsightCards for the By-Topic view (BUILD-SPEC §6.5).
export default function TopicGrid({ insights }: { insights: Insight[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {insights.map((ins) => (
        <InsightCard key={ins.id} insight={ins} />
      ))}
    </div>
  );
}
