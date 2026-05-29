import Image from "next/image";
import Link from "next/link";
import { Eye, Play, Quote } from "lucide-react";
import type { Insight } from "@/lib/types";
import { compactNumber, timestamp } from "@/lib/format";
import { topicToSlug } from "@/lib/types";
import ShareButton from "./ShareButton";

// THE core component (BUILD-SPEC §6.5). Hook-free + presentational, so it renders
// in both Server (insight/video/topic pages) and Client (Explorer) trees.
export default function InsightCard({
  insight,
  index,
  featured = false,
}: {
  insight: Insight;
  index?: number; // 1-based corner badge in By-Video context
  featured?: boolean;
}) {
  const { id, takeaway, quote, topic, tags, deepLink, videoTitle, thumb, videoViews, offsetSec } =
    insight;

  return (
    <article
      className={`group relative flex flex-col rounded-2xl border border-line bg-card shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover ${
        featured ? "p-6 sm:p-8" : "p-5"
      }`}
    >
      {/* maroon left-border accent on hover */}
      <span className="pointer-events-none absolute inset-y-3 left-0 w-1 rounded-full bg-maroon opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      {typeof index === "number" && (
        <span className="absolute right-4 top-4 font-display text-2xl leading-none text-line">
          {String(index).padStart(2, "0")}
        </span>
      )}

      {/* top row: topic pill + views */}
      <div className="mb-3 flex items-center gap-2 pr-8">
        <Link href={`/topic/${topicToSlug(topic)}`} className="topic-pill hover:bg-maroon/20">
          {topic}
        </Link>
        <span className="ml-auto inline-flex items-center gap-1 text-[0.7rem] font-medium text-muted">
          <Eye size={13} /> {compactNumber(videoViews)}
        </span>
      </div>

      {/* optional quote */}
      {quote && (
        <div className="mb-2 flex gap-2">
          <Quote size={16} className="mt-0.5 shrink-0 text-maroon/60" />
          <p className="text-[0.95rem] italic leading-snug text-muted">{quote}</p>
        </div>
      )}

      {/* the takeaway, hero of the card */}
      <Link href={`/insight/${id}`} className="group/tk">
        <p
          className={`font-medium text-ink decoration-maroon/30 underline-offset-2 group-hover/tk:underline ${
            featured ? "text-xl leading-snug sm:text-2xl" : "text-[1.06rem] leading-snug"
          }`}
        >
          {takeaway}
        </p>
      </Link>

      {/* tags */}
      {tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className="rounded-md bg-cream px-2 py-0.5 text-[0.68rem] text-muted">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* footer: thumb + title + watch chip + share */}
      <div className="mt-4 flex items-center gap-3 border-t border-line pt-3">
        <Link
          href={`/video/${insight.videoId}`}
          className="relative h-9 w-16 shrink-0 overflow-hidden rounded-md bg-cream"
        >
          <Image
            src={thumb}
            alt=""
            fill
            sizes="64px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <Link
          href={`/video/${insight.videoId}`}
          className="min-w-0 flex-1 truncate text-[0.78rem] text-muted hover:text-ink"
          title={videoTitle}
        >
          {videoTitle}
        </Link>
        <a
          href={deepLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-maroon px-2.5 py-1 text-[0.72rem] font-semibold text-cream transition hover:bg-maroon-deep"
        >
          <Play size={11} className="fill-cream" />
          {timestamp(offsetSec)}
        </a>
        <ShareButton insightId={id} takeaway={takeaway} deepLink={deepLink} />
      </div>
    </article>
  );
}
