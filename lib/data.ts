// Typed loaders over the generated /data/*.json. Server-side; tree-shaken out
// of the client bundle except where a Client Component imports a plain array.

import insightsJson from "@/data/insights.json";
import videosJson from "@/data/videos.json";
import statsJson from "@/data/stats.json";
import type { Insight, Stats, Topic, Video } from "./types";

export const insights: Insight[] = insightsJson as Insight[];
export const videos: Video[] = videosJson as Video[];
export const stats: Stats = statsJson as unknown as Stats;

// ── lookups ──────────────────────────────────────────────────────────────
const insightById = new Map(insights.map((i) => [i.id, i]));
const videoById = new Map(videos.map((v) => [v.id, v]));

export const getInsight = (id: string): Insight | undefined => insightById.get(id);
export const getVideo = (id: string): Video | undefined => videoById.get(id);

export const insightsForVideo = (videoId: string): Insight[] =>
  insights.filter((i) => i.videoId === videoId);

export const insightsForTopic = (topic: Topic): Insight[] =>
  insights.filter((i) => i.topic === topic);

// ── derived collections for views ──────────────────────────────────────────

/** Videos that actually have insights, sorted by views desc (the By Video view). */
export const videosWithInsights = (): Video[] =>
  videos.filter((v) => v.insightCount > 0).sort((a, b) => b.views - a.views);

/** Count of insights per topic (for chip badges + topic pages). */
export const insightCountByTopic = (): Record<string, number> => {
  const m: Record<string, number> = {};
  for (const i of insights) m[i.topic] = (m[i.topic] || 0) + 1;
  return m;
};

/** Stable "Insight of the Day": deterministic by UTC day so SSG is consistent. */
export function insightOfTheDay(dayIndex: number): Insight {
  // Prefer insights that carry a quote, they make the most striking feature card.
  const pool = insights.filter((i) => i.quote) ;
  const list = pool.length ? pool : insights;
  return list[dayIndex % list.length];
}

export const totalInsights = (): number => insights.length;
