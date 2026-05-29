"use client";

import { ChevronDown } from "lucide-react";
import { TOPICS } from "@/lib/types";
import ViewToggle, { type ViewMode } from "./ViewToggle";
import type { SortKey } from "@/lib/search";

// Sticky filter bar under the header: topic chips + view toggle + sort. §6.5
export default function FilterBar({
  topic,
  onTopic,
  counts,
  view,
  onView,
  sort,
  onSort,
}: {
  topic: string; // "all" | Topic
  onTopic: (t: string) => void;
  counts: Record<string, number>;
  view: ViewMode;
  onView: (v: ViewMode) => void;
  sort: SortKey;
  onSort: (s: SortKey) => void;
}) {
  const chips = ["all", ...TOPICS];
  return (
    <div className="sticky top-16 z-40 border-b border-line bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/80">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
        {/* topic chips, horizontal scroll on mobile */}
        <div className="no-scrollbar -mx-1 flex flex-1 items-center gap-1.5 overflow-x-auto px-1">
          {chips.map((c) => {
            const active = topic === c;
            const label = c === "all" ? "All" : c;
            const n = c === "all" ? undefined : counts[c] || 0;
            return (
              <button
                key={c}
                onClick={() => onTopic(c)}
                aria-pressed={active}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.78rem] font-semibold transition ${
                  active
                    ? "border-maroon bg-maroon text-cream"
                    : "border-line bg-card text-ink hover:border-maroon/40"
                }`}
              >
                {label}
                {n !== undefined && (
                  <span
                    className={`rounded-full px-1.5 text-[0.62rem] ${
                      active ? "bg-cream/20 text-cream" : "bg-cream text-muted"
                    }`}
                  >
                    {n}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* right controls */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="relative hidden sm:block">
            <select
              value={sort}
              onChange={(e) => onSort(e.target.value as SortKey)}
              aria-label="Sort lessons"
              className="appearance-none rounded-full border border-line bg-card py-1.5 pl-3 pr-8 text-[0.78rem] font-semibold text-ink focus:border-maroon focus:outline-none"
            >
              <option value="views">Most viewed</option>
              <option value="newest">Newest</option>
              <option value="az">A-Z</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
            />
          </div>
          <ViewToggle value={view} onChange={onView} />
        </div>
      </div>
    </div>
  );
}
