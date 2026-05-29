import type { Metadata } from "next";
import Link from "next/link";
import { Eye, MessageCircle, ThumbsUp } from "lucide-react";
import { getVideo, stats } from "@/lib/data";
import { compactNumber, humanDuration, indianNumber } from "@/lib/format";
import { topicToSlug } from "@/lib/types";
import CountUp from "@/components/CountUp";

export const metadata: Metadata = {
  title: "LLA By the Numbers",
  description:
    "Two billion views. 2,087 videos. Eight years of making India Jagruk, the Labour Law Advisor catalog, in numbers.",
  alternates: { canonical: "/numbers" },
  openGraph: {
    title: "LLA By the Numbers",
    description: "Two billion views. 2,087 videos. Eight years. The LLA catalog in numbers.",
    url: "/numbers",
  },
};

export default function NumbersPage() {
  const t = stats.totals;
  const runtime = humanDuration(t.total_runtime_sec);
  const maxYearViews = Math.max(...stats.byYear.map((y) => y.views));
  const big4 = ["Salary & PF", "Investing", "Tax", "Insurance"]
    .map((name) => stats.topics.find((s) => s.topic === name))
    .filter(Boolean) as { topic: string; count: number; views: number }[];

  const mostViewed = stats.topLongform[0];
  const mostLiked = stats.topByLikes[0];
  const mostDiscussed = stats.topByComments[0];

  return (
    <div className="bg-cream">
      {/* hero panel */}
      <Panel>
        <p className="meta-label text-gold">LLA · By the Numbers</p>
        <h1 className="mt-3 font-display text-hero uppercase leading-[0.9] text-cream">
          Two billion.
          <br />
          <span className="text-gold">Yes, billion.</span>
        </h1>
        <p className="mt-6 font-display text-5xl text-cream sm:text-7xl">
          <CountUp value={t.total_views} format="number" />
        </p>
        <p className="mt-2 text-cream/70">
          total views across {indianNumber(t.videos)} videos, {indianNumber(t.total_views)} and
          counting.
        </p>
      </Panel>

      {/* big stat trio */}
      <Panel tone="cream">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <BigStat
            value={t.videos}
            label="videos shipped"
            sub={`in ${Number(t.last_year) - Number(t.first_year)} years`}
          />
          <BigStat value={t.total_likes} label="likes" compact />
          <BigStat value={t.total_insights} label="lessons distilled" sub="and growing" />
        </div>
      </Panel>

      {/* by year */}
      <Panel>
        <h2 className="font-display text-section uppercase text-cream">
          {t.videos.toLocaleString("en-IN")} videos in {Number(t.last_year) - Number(t.first_year)}{" "}
          years
        </h2>
        <p className="mt-2 text-cream/70">
          2022 was peak Jagruk, {compactNumber(
            stats.byYear.find((y) => y.year === "2022")?.views || 0
          )}{" "}
          views in a single year.
        </p>
        <div className="mt-8 flex items-end gap-2 sm:gap-3">
          {stats.byYear.map((y) => (
            <div key={y.year} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[0.62rem] text-cream/60">{compactNumber(y.views)}</span>
              <div
                className="w-full rounded-t bg-gradient-to-t from-gold/40 to-gold"
                style={{ height: `${Math.max(6, (y.views / maxYearViews) * 180)}px` }}
                title={`${y.year}: ${indianNumber(y.views)} views`}
              />
              <span className="text-[0.66rem] font-semibold text-cream/80">{y.year}</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* big 4 topics */}
      <Panel tone="cream">
        <h2 className="font-display text-section uppercase text-ink">The Big 4 topics</h2>
        <p className="mt-2 text-muted">Where LLA spends its teaching energy (long-form videos).</p>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {big4.map((s) => (
            <Link
              key={s.topic}
              href={`/topic/${topicToSlug(s.topic)}`}
              className="rounded-2xl border border-line bg-card p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <p className="font-display text-5xl text-maroon">
                <CountUp value={s.count} />
              </p>
              <p className="mt-2 font-semibold text-ink">{s.topic}</p>
              <p className="mt-1 text-sm text-muted">{compactNumber(s.views)} views</p>
            </Link>
          ))}
        </div>
      </Panel>

      {/* records */}
      <Panel>
        <h2 className="font-display text-section uppercase text-cream">The record holders</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <RecordCard Icon={Eye} label="Most viewed" video={mostViewed} metric={`${compactNumber(mostViewed.views)} views`} />
          <RecordCard Icon={ThumbsUp} label="Most liked" video={mostLiked} metric={`${compactNumber(mostLiked.likes || 0)} likes`} />
          <RecordCard Icon={MessageCircle} label="Most discussed" video={mostDiscussed} metric={`${compactNumber(mostDiscussed.comments || 0)} comments`} />
        </div>
      </Panel>

      {/* runtime */}
      <Panel tone="cream">
        <h2 className="font-display text-section uppercase text-ink">
          If you watched everything back-to-back…
        </h2>
        <p className="mt-6 font-display text-6xl text-maroon sm:text-8xl">
          <CountUp value={t.total_runtime_sec / 86400} format="fixed1" durationMs={1400} /> days
        </p>
        <p className="mt-3 text-muted">
          {runtime.long} of money education, straight through, no breaks
          {t.total_runtime_estimated ? " (estimated)" : ""}.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-maroon px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-maroon-deep"
        >
          Browse the lessons →
        </Link>
      </Panel>
    </div>
  );
}

function Panel({
  children,
  tone = "maroon",
}: {
  children: React.ReactNode;
  tone?: "maroon" | "cream";
}) {
  return (
    <section className={tone === "maroon" ? "bg-maroon-grad" : "bg-cream"}>
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">{children}</div>
    </section>
  );
}

function BigStat({
  value,
  label,
  sub,
  compact = false,
}: {
  value: number;
  label: string;
  sub?: string;
  compact?: boolean;
}) {
  return (
    <div>
      <p className="font-display text-6xl text-maroon">
        <CountUp value={value} format={compact ? "compact" : "number"} />
      </p>
      <p className="mt-2 font-semibold uppercase tracking-wide text-ink">{label}</p>
      {sub && <p className="text-sm text-muted">{sub}</p>}
    </div>
  );
}

function RecordCard({
  Icon,
  label,
  video,
  metric,
}: {
  Icon: typeof Eye;
  label: string;
  video: { id: string; title: string };
  metric: string;
}) {
  const exists = !!getVideo(video.id);
  const inner = (
    <div className="flex h-full flex-col rounded-2xl border border-cream/15 bg-cream/5 p-5 backdrop-blur-sm transition hover:bg-cream/10">
      <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-gold">
        <Icon size={13} /> {label}
      </span>
      <p className="clamp-3 mt-3 flex-1 font-medium leading-snug text-cream">{video.title}</p>
      <p className="mt-3 font-display text-2xl text-cream">{metric}</p>
    </div>
  );
  return exists ? (
    <Link href={`/video/${video.id}`}>{inner}</Link>
  ) : (
    <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  );
}
