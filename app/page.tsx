import { Suspense } from "react";
import Hero from "@/components/Hero";
import InsightOfTheDay from "@/components/InsightOfTheDay";
import Explorer from "@/components/Explorer";
import {
  insightCountByTopic,
  insightOfTheDay,
  insights,
  stats,
  totalInsights,
  videosWithInsights,
} from "@/lib/data";
import { dayOfYear } from "@/lib/format";

export default function HomePage() {
  const counts = insightCountByTopic();
  const featured = insightOfTheDay(dayOfYear());
  const videos = videosWithInsights();

  return (
    <>
      <Hero stats={stats} insightCount={totalInsights()} videoCount={videos.length} />
      <InsightOfTheDay insight={featured} />
      <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-20 text-muted">Loading…</div>}>
        <Explorer insights={insights} videos={videos} counts={counts} />
      </Suspense>
    </>
  );
}
