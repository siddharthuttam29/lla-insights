import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Play } from "lucide-react";
import {
  getInsight,
  getVideo,
  insights,
  insightsForTopic,
  insightsForVideo,
} from "@/lib/data";
import { compactNumber, timestamp } from "@/lib/format";
import { topicToSlug } from "@/lib/types";
import { SITE } from "@/lib/site";
import InsightCard from "@/components/InsightCard";
import ShareButton from "@/components/ShareButton";

export function generateStaticParams() {
  return insights.map((i) => ({ id: i.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const insight = getInsight(params.id);
  if (!insight) return { title: "Insight not found" };
  const title = insight.takeaway.slice(0, 70);
  return {
    title,
    description: `${insight.takeaway}, a money lesson from "${insight.videoTitle}" by Labour Law Advisor.`,
    alternates: { canonical: `/insight/${insight.id}` },
    openGraph: {
      title: "LLA Insights",
      description: insight.takeaway,
      url: `/insight/${insight.id}`,
      // og:image auto-injected by app/insight/[id]/opengraph-image.tsx
    },
    twitter: { card: "summary_large_image" },
  };
}

export default function InsightPage({ params }: { params: { id: string } }) {
  const insight = getInsight(params.id);
  if (!insight) notFound();
  const video = getVideo(insight.videoId);

  // Related: other insights from the same video, then top up from the topic.
  const sameVideo = insightsForVideo(insight.videoId).filter((i) => i.id !== insight.id);
  const sameTopic = insightsForTopic(insight.topic).filter(
    (i) => i.id !== insight.id && i.videoId !== insight.videoId
  );
  const related = [...sameVideo, ...sameTopic].slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: insight.takeaway,
    about: insight.topic,
    isBasedOn: insight.deepLink,
    datePublished: insight.publishedAt,
    author: { "@type": "Organization", name: "Labour Law Advisor" },
    publisher: { "@type": "Organization", name: "LLA Insights (unofficial)" },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href={`/topic/${topicToSlug(insight.topic)}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft size={15} /> {insight.topic}
      </Link>

      {/* the feature lesson */}
      <article className="mt-4 rounded-2xl border border-line bg-card p-6 shadow-card sm:p-9">
        <div className="flex items-center justify-between">
          <Link href={`/topic/${topicToSlug(insight.topic)}`} className="topic-pill">
            {insight.topic}
          </Link>
          <ShareButton
            insightId={insight.id}
            takeaway={insight.takeaway}
            deepLink={insight.deepLink}
            size="md"
          />
        </div>

        {insight.quote && (
          <p className="mt-5 border-l-2 border-maroon/40 pl-4 text-lg italic text-muted">
            “{insight.quote}”
          </p>
        )}

        <h1 className="mt-5 font-display text-3xl leading-tight tracking-tight text-ink sm:text-4xl">
          {insight.takeaway}
        </h1>

        {insight.tags?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {insight.tags.map((t) => (
              <span key={t} className="rounded-md bg-cream px-2.5 py-1 text-xs text-muted">
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* source video */}
        <div className="mt-7 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <Link
            href={`/video/${insight.videoId}`}
            className="relative aspect-video w-full overflow-hidden rounded-xl bg-cream sm:w-48"
          >
            <Image src={insight.thumb} alt="" fill sizes="200px" className="object-cover" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="meta-label text-muted">Source</p>
            <Link
              href={`/video/${insight.videoId}`}
              className="mt-1 block font-medium text-ink hover:text-maroon"
            >
              {insight.videoTitle}
            </Link>
            <p className="mt-0.5 text-sm text-muted">
              {compactNumber(insight.videoViews)} views
            </p>
            <a
              href={insight.deepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-maroon px-4 py-2 text-sm font-semibold text-cream transition hover:bg-maroon-deep"
            >
              <Play size={13} className="fill-cream" />
              Watch at {timestamp(insight.offsetSec)}
            </a>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-section uppercase text-ink">Related lessons</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <InsightCard key={r.id} insight={r} />
            ))}
          </div>
        </section>
      )}

      <p className="mt-10 text-center text-xs text-muted">
        Lesson distilled from {SITE.channelHandle}&apos;s public video. Unofficial · not affiliated.
      </p>
    </div>
  );
}
