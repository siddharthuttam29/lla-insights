// Client-side fuzzy search over insights (BUILD-SPEC §7).
import Fuse from "fuse.js";
import type { Insight } from "./types";

export function buildIndex(items: Insight[]): Fuse<Insight> {
  return new Fuse(items, {
    includeScore: true,
    threshold: 0.38, // forgiving but not noisy
    ignoreLocation: true,
    minMatchCharLength: 2,
    keys: [
      { name: "takeaway", weight: 0.5 },
      { name: "tags", weight: 0.2 },
      { name: "videoTitle", weight: 0.2 },
      { name: "quote", weight: 0.1 },
    ],
  });
}

export function runSearch(fuse: Fuse<Insight>, query: string, fallback: Insight[]): Insight[] {
  const q = query.trim();
  if (!q) return fallback;
  return fuse.search(q).map((r) => r.item);
}

export type SortKey = "views" | "newest" | "az";

export function sortInsights(list: Insight[], sort: SortKey): Insight[] {
  const arr = [...list];
  switch (sort) {
    case "newest":
      return arr.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
    case "az":
      return arr.sort((a, b) => a.takeaway.localeCompare(b.takeaway));
    case "views":
    default:
      return arr.sort((a, b) => b.videoViews - a.videoViews);
  }
}
