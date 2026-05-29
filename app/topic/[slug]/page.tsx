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

// Server-rendered pagination so each page is independently shareable + SEO-
// indexable. Uses ?page=N (1-based). Page size = 30, matching the home grid.
const PAGE_SIZE = 30;

export default function TopicPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { page?: string };
}) {
  const topic = slugToTopic(params.slug);
  if (!topic) notFound();
  const list = sortInsights(insightsForTopic(topic), "views");

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = Math.min(totalPages, Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1));
  const start = (page - 1) * PAGE_SIZE;
  const visible = list.slice(start, start + PAGE_SIZE);

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
        <>
          <div className="mt-6 flex items-baseline justify-between text-sm text-muted">
            <span>
              Showing{" "}
              <span className="font-semibold text-ink">
                {start + 1}-{start + visible.length}
              </span>{" "}
              of {list.length}
            </span>
            {totalPages > 1 && (
              <span className="text-[0.72rem] uppercase tracking-wide">
                Page {page} of {totalPages}
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((i) => (
              <InsightCard key={i.id} insight={i} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-10 flex flex-wrap items-center justify-center gap-2"
            >
              {page > 1 && (
                <Link
                  href={`/topic/${params.slug}${page === 2 ? "" : `?page=${page - 1}`}`}
                  className="rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold text-ink hover:border-maroon/40"
                >
                  ← Previous
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                // compact range: first, last, and ±1 around current
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center gap-2">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="text-muted">…</span>
                    )}
                    <Link
                      href={`/topic/${params.slug}${p === 1 ? "" : `?page=${p}`}`}
                      aria-current={p === page ? "page" : undefined}
                      className={`grid h-9 min-w-9 place-items-center rounded-full px-3 text-sm font-semibold transition ${
                        p === page
                          ? "bg-maroon text-cream"
                          : "border border-line bg-card text-ink hover:border-maroon/40"
                      }`}
                    >
                      {p}
                    </Link>
                  </span>
                ))}
              {page < totalPages && (
                <Link
                  href={`/topic/${params.slug}?page=${page + 1}`}
                  className="rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold text-ink hover:border-maroon/40"
                >
                  Next →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
