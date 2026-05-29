"use client";

import { LayoutGrid, ListVideo } from "lucide-react";

export type ViewMode = "video" | "topic";

// Segmented control: By Video ⇄ By Topic (BUILD-SPEC §6.5).
export default function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  const items: { key: ViewMode; label: string; Icon: typeof ListVideo }[] = [
    { key: "video", label: "By Video", Icon: ListVideo },
    { key: "topic", label: "By Topic", Icon: LayoutGrid },
  ];
  return (
    <div
      role="tablist"
      aria-label="View mode"
      className="inline-flex rounded-full border border-line bg-card p-0.5"
    >
      {items.map(({ key, label, Icon }) => {
        const active = value === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.78rem] font-semibold transition ${
              active ? "bg-maroon text-cream shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            <Icon size={14} />
            <span className="whitespace-nowrap">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
