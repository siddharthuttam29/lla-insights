import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, MessageCircle, Play, ThumbsUp } from "lucide-react";
import { getVideo, insightsForVideo, videosWithInsights } from "@/lib/data";
import { compactNumber, monthYear, timestamp } from "@/lib/format";
import { topicToSlug } from "@/lib/types";
import InsightCard from "@/components/InsightCard";

export function generateStaticParams() {
  return videosWithInsights().map((v) => ({ videoId: v.id }));
}

export function generateMetadata({ params }: { params: { videoId: string } }): Metadata {
  const video = getVideo(params.videoId);
  if (!video) return { title: "Video not found" };
  const n = insightsForVideo(video.id).length;
  return {
    title: video.title,
    description: `${n} money lessons distilled from "${video.title}" by Labour Law Advisor, each timestamped to the source.`,
    alternates: { canonical: `/video/${video.id}` },
    openGraph: {
      title: video.title,
      description: `${n} distilled money lessons, timestamped to the source video.`,
      url: `/video/${video.id}`,
    },
  };
}

export default function VideoPage({ params }: { params: { videoId: string } }) {
  const video = getVideo(params.videoId);
  if (!video) notFound();
  const list = insightsForVideo(video.id).sort((a, b) => a.offsetSec - b.offsetSec);

  const meta = [
    { Icon: Eye, value: `${compactNumber(video.views)} views` },
    { Icon: ThumbsUp, value: compactNumber(video.likes) },
    { Icon: MessageCircle, value: compactNumber(video.comments) },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={15} /> All videos
      </Link>

      {/* video header */}
      <header className="mt-4 flex flex-col gap-6 rounded-2xl border border-line bg-card p-5 shadow-card sm:flex-row sm:p-7">
        <a
          href={`https://www.youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-cream sm:w-80"
        >
          <Image
            src={video.thumb}
            alt={video.title}
            fill
            sizes="(max-width:640px) 100vw, 320px"
            className="object-cover"
          />
          <span className="absolute inset-0 grid place-items-center bg-ink/0 transition group-hover:bg-ink/20">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-maroon/90 text-cream opacity-0 transition group-hover:opacity-100">
              <Play size={20} className="fill-cream" />
            </span>
          </span>
        </a>

        <div className="min-w-0 flex-1">
          <Link href={`/topic/${topicToSlug(video.topic)}`} className="topic-pill">
            {video.topic}
          </Link>
          <h1 className="mt-3 font-display text-2xl leading-tight tracking-tight text-ink sm:text-3xl">
            {video.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            {meta.map(({ Icon, value }) => (
              <span key={value} className="inline-flex items-center gap-1.5">
                <Icon size={14} /> {value}
              </span>
            ))}
            <span>{monthYear(video.publishedAt)}</span>
          </div>
          <p className="mt-4 text-sm text-muted">
            <strong className="font-semibold text-ink">{list.length}</strong> lessons distilled
            from this video.
          </p>
        </div>
      </header>

      {/* insights */}
      <section className="mt-8">
        <h2 className="mb-4 font-display text-section uppercase text-ink">The lessons</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {list.map((ins, i) => (
            <InsightCard key={ins.id} insight={ins} index={i + 1} />
          ))}
        </div>
      </section>
    </div>
  );
}
