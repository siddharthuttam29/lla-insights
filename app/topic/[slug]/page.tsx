import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { insightsForTopic } from "@/lib/data";
import { TOPICS, slugToTopic, topicToSlug } from "@/lib/types";
import InsightCard from "@/components/InsightCard";
import { sortInsights } from "@/lib/search";

export function generateStaticParams() {
  return TOPICS.map((t) => ({ slug: topicToSlug(t) }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const topic = slugToTopic(params.slug);
  if (!topic) return { title: "Topic not found" };
  const n = insightsForTopic(topic).length;
  return {
    title: `${topic}, LLA's money lessons`,
    description: `${n} ${topic} lessons distilled from Labour Law Advisor's videos, each timestamped to the source.`,
    alternates: { canonical: `/topic/${params.slug}` },
    openGraph: {
      title: `${topic} · LLA Insights`,
      description: `${n} ${topic} lessons from Labour Law Advisor, distilled and timestamped.`,
      url: `/topic/${params.slug}`,
    },
  };
}

export default function TopicPage({ params }: { params: { slug: string } }) {
  const topic = slugToTopic(params.slug);
  if (!topic) notFound();
  const list = sortInsights(insightsForTopic(topic), "views");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${topic}, LLA money lessons`,
    numberOfItems: list.length,
    itemListElement: list.slice(0, 30).map((i, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: i.takeaway,
      url: `/insight/${i.id}`,
    })),
  };

  const others = TOPICS.filter((t) => t !== topic);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={15} /> Home
      </Link>

      <header className="mt-4 border-b border-line pb-6">
        <h1 className="font-display text-hero uppercase leading-none text-maroon">{topic}</h1>
        <p className="mt-3 text-muted">
          <strong className="font-semibold text-ink">{list.length}</strong> lessons from Labour Law
          Advisor, distilled and timestamped to the source.
        </p>
      </header>

      {/* other topic chips */}
      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
        {others.map((t) => (
          <Link
            key={t}
            href={`/topic/${topicToSlug(t)}`}
            className="shrink-0 rounded-full border border-line bg-card px-3 py-1.5 text-[0.78rem] font-semibold text-ink transition hover:border-maroon/40"
          >
            {t}
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="mt-16 text-center text-muted">
          No lessons here yet, this topic fills in as more of LLA&apos;s catalog is processed.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((i) => (
            <InsightCard key={i.id} insight={i} />
          ))}
        </div>
      )}
    </div>
  );
}
