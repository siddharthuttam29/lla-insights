"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Insight, Video } from "@/lib/types";
import { compactNumber, monthYear } from "@/lib/format";
import InsightCard from "./InsightCard";

// By-Video accordion (BUILD-SPEC §6.5). Bold title block + "N INSIGHTS" badge +
// dotted leader + chevron; expands to a stagger-revealed grid of numbered cards.
export default function VideoAccordion({
  video,
  insights,
  defaultOpen = false,
}: {
  video: Video;
  insights: Insight[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const reduce = useReducedMotion();

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-card">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-4 text-left sm:p-5"
      >
        {/* title block on a soft maroon-tinted plate */}
        <div className="min-w-0 flex-1">
          <h3 className="clamp-2 font-display text-lg uppercase leading-tight tracking-tight text-ink sm:text-xl">
            {video.title}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] text-muted">
            <span className="topic-pill">{video.topic}</span>
            <span className="inline-flex items-center gap-1">
              <Eye size={12} /> {compactNumber(video.views)} views
            </span>
            <span>{monthYear(video.publishedAt)}</span>
          </div>
        </div>

        {/* dotted leader */}
        <span className="mx-1 hidden h-px flex-1 border-b border-dotted border-line sm:block" />

        <span className="shrink-0 rounded-full bg-maroon px-3 py-1 font-display text-sm tracking-wide text-cream">
          {insights.length} {insights.length === 1 ? "INSIGHT" : "INSIGHTS"}
        </span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-muted transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-line p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <Link
                  href={`/video/${video.id}`}
                  className="text-[0.78rem] font-semibold text-maroon hover:underline"
                >
                  Open video page →
                </Link>
              </div>
              <motion.div
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
                variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.03 } } }}
                initial="hidden"
                animate="show"
              >
                {insights.map((ins, i) => (
                  <motion.div
                    key={ins.id}
                    variants={{
                      hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 8 },
                      show: { opacity: 1, y: 0 },
                    }}
                  >
                    <InsightCard insight={ins} index={i + 1} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
