"use client";

import { ChevronDown, SearchX } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

// Cap the initial render so 929 cards don't all hit the DOM at once. Local
// state (not URL) so "Load more" doesn't pollute history, and so navigating
// away + back doesn't lose your scroll position. Reset when topic/q/sort
// changes (different query, fresh start).
const TOPIC_PAGE_SIZE = 30; // cards per page in the flat By-Topic grid
const VIDEO_PAGE_SIZE = 12; // accordions per page in the By-Video view
import type { Insight, Video } from "@/lib/types";
import { slugToTopic, topicToSlug } from "@/lib/types";
import { buildIndex, runSearch, sortInsights, type SortKey } from "@/lib/search";
import FilterBar from "./FilterBar";
import TopicGrid from "./TopicGrid";
import VideoAccordion from "./VideoAccordion";
import type { ViewMode } from "./ViewToggle";

export default function Explorer({
  insights,
  videos,
  counts,
}: {
  insights: Insight[];
  videos: Video[];
  counts: Record<string, number>;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  // ── derive state from the URL (single source of truth) ──────────────────
  const q = sp.get("q") ?? "";
  const view: ViewMode = sp.get("view") === "video" ? "video" : "topic";
  const topic = slugToTopic(sp.get("topic") ?? "") ?? "all";
  const sort = (["views", "newest", "az"].includes(sp.get("sort") ?? "")
    ? sp.get("sort")
    : "views") as SortKey;

  const setParam = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(Array.from(sp.entries()));
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === "") params.delete(k);
        else params.set(k, v);
      }
      const qs = params.toString();
      router.replace(`/${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, sp]
  );

  // ── fuse index (memoized over the full set) ─────────────────────────────
  const fuse = useMemo(() => buildIndex(insights), [insights]);

  // ── compose: topic ∧ search, then sort ──────────────────────────────────
  const filtered = useMemo(() => {
    let list = q ? runSearch(fuse, q, insights) : insights;
    if (topic !== "all") list = list.filter((i) => i.topic === topic);
    return sortInsights(list, sort);
  }, [fuse, q, topic, sort, insights]);

  // group filtered insights by video for the By-Video view
  const videoGroups = useMemo(() => {
    const byId = new Map<string, Video>(videos.map((v) => [v.id, v]));
    const groups = new Map<string, Insight[]>();
    for (const ins of filtered) {
      if (!groups.has(ins.videoId)) groups.set(ins.videoId, []);
      groups.get(ins.videoId)!.push(ins);
    }
    const arr = Array.from(groups.entries())
      .map(([id, list]) => ({
        video: byId.get(id)!,
        insights: [...list].sort((a, b) => a.offsetSec - b.offsetSec),
      }))
      .filter((g) => g.video);
    // order the accordions by the active sort
    arr.sort((a, b) => {
      if (sort === "newest")
        return +new Date(b.video.publishedAt) - +new Date(a.video.publishedAt);
      if (sort === "az") return a.video.title.localeCompare(b.video.title);
      return b.video.views - a.video.views;
    });
    return arr;
  }, [filtered, videos, sort]);

  const resultLabel = `${filtered.length.toLocaleString("en-IN")} ${
    filtered.length === 1 ? "lesson" : "lessons"
  }`;

  // ── render pagination (local state) ────────────────────────────────────
  const pageSize = view === "topic" ? TOPIC_PAGE_SIZE : VIDEO_PAGE_SIZE;
  const totalUnits = view === "topic" ? filtered.length : videoGroups.length;
  const [visibleCount, setVisibleCount] = useState(pageSize);
  // Reset whenever the active query/filter changes so users don't see a stale
  // "show 90" hangover when they switch topics.
  useEffect(() => setVisibleCount(pageSize), [topic, q, sort, view, pageSize]);
  const visibleCards = filtered.slice(0, visibleCount);
  const visibleGroups = videoGroups.slice(0, visibleCount);
  const remaining = Math.max(0, totalUnits - visibleCount);

  return (
    <>
      <FilterBar
        topic={topic}
        onTopic={(t) => setParam({ topic: t === "all" ? null : topicToSlug(t) })}
        counts={counts}
        view={view}
        onView={(v) => setParam({ view: v === "topic" ? null : v })}
        sort={sort}
        onSort={(s) => setParam({ sort: s === "views" ? null : s })}
      />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* result count + active query echo */}
        <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="font-display text-section uppercase text-ink">
            {topic === "all" ? "All money lessons" : topic}
          </h2>
          <span className="text-sm text-muted">
            {view === "topic" && totalUnits > pageSize ? (
              <>
                Showing <span className="font-semibold text-ink">{visibleCards.length}</span> of{" "}
                {resultLabel}
              </>
            ) : view === "video" && totalUnits > pageSize ? (
              <>
                Showing <span className="font-semibold text-ink">{visibleGroups.length}</span> of{" "}
                {videoGroups.length} videos · {resultLabel} total
              </>
            ) : (
              resultLabel
            )}
            {q && (
              <>
                {" "}for &ldquo;<span className="text-ink">{q}</span>&rdquo;
              </>
            )}
          </span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState />
        ) : view === "topic" ? (
          <div key={`${topic}-${q}-${sort}`} className="animate-fade-up">
            <TopicGrid insights={visibleCards} />
          </div>
        ) : (
          <div key={`${topic}-${q}-${sort}`} className="flex animate-fade-up flex-col gap-3">
            {visibleGroups.map((g) => (
              <VideoAccordion
                key={g.video.id}
                video={g.video}
                insights={g.insights}
                defaultOpen={!!q}
              />
            ))}
          </div>
        )}

        {remaining > 0 && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setVisibleCount((n) => n + pageSize)}
              className="inline-flex items-center gap-2 rounded-full bg-maroon px-5 py-2.5 text-sm font-semibold text-cream shadow-card transition hover:bg-maroon-deep hover:shadow-card-hover focus-visible:ring-brand"
            >
              <ChevronDown size={16} />
              Load {Math.min(pageSize, remaining)} more
            </button>
            <p className="text-[0.72rem] uppercase tracking-wide text-muted">
              {remaining.toLocaleString("en-IN")} {view === "topic" ? "lessons" : "videos"} still hidden
            </p>
          </div>
        )}
      </section>
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-card/60 py-20 text-center">
      <SearchX size={32} className="text-muted/60" />
      <p className="mt-4 font-display text-xl uppercase text-ink">No lessons match</p>
      <p className="mt-1 max-w-sm text-sm text-muted">
        Try a broader term like <span className="font-semibold text-maroon">credit card</span>,{" "}
        <span className="font-semibold text-maroon">PF</span>, or{" "}
        <span className="font-semibold text-maroon">term insurance</span>, or clear the topic
        filter.
      </p>
    </div>
  );
}
