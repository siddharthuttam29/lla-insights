import type { Metadata } from "next";
import Link from "next/link";
import { stats, totalInsights } from "@/lib/data";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "What LLA Insights is, who made it, and the unofficial / not-affiliated disclaimer. All credit for the underlying content belongs to Labour Law Advisor.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const captured = stats._meta?.captured;
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-hero uppercase leading-none text-maroon">About</h1>

      <div className="mt-8 space-y-6 text-[1.02rem] leading-relaxed text-ink">
        <p>
          <strong>LLA Insights</strong> is a searchable library of the sharpest money lessons from{" "}
          <a
            href={SITE.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-maroon underline underline-offset-2"
          >
            Labour Law Advisor
          </a>
          ’s YouTube catalog. Every video&apos;s best takeaways are distilled into bite-sized,
          shareable cards, organized by video and by money topic, and timestamped straight back to
          the moment in the source video.
        </p>

        <p>
          It exists because LLA has quietly built one of India&apos;s most useful personal-finance
          archives, {stats.totals.videos.toLocaleString("en-IN")} videos, over two billion views , 
          and great advice deserves to be findable. Right now there are{" "}
          <strong>{totalInsights().toLocaleString("en-IN")}</strong> lessons here, growing as more
          of the catalog is processed.
        </p>

        <div className="rounded-2xl border border-line bg-card p-6 shadow-card">
          <h2 className="font-display text-lg uppercase tracking-wide text-maroon">
            Unofficial · not affiliated
          </h2>
          <p className="mt-3 text-[0.96rem] text-muted">
            This is an unofficial fan/tribute project. It is not affiliated with, endorsed by, or
            operated by Labour Law Advisor. All credit for the underlying content belongs to{" "}
            <strong className="text-ink">{SITE.hosts}</strong>. This site simply organizes and links
            to their public videos, every card drives traffic back to the original.
          </p>
        </div>

        <div>
          <h2 className="font-display text-lg uppercase tracking-wide text-maroon">
            How it&apos;s built
          </h2>
          <p className="mt-3 text-muted">
            An offline pipeline pulls LLA&apos;s public catalog and transcripts, then an LLM distills
            6-10 standalone lessons per video. The takeaways are transformative summaries in our own
            words; any quoted line is kept short and attributed, linking back to the source. Whole
            transcripts are never reproduced here.
          </p>
        </div>

        <div>
          <h2 className="font-display text-lg uppercase tracking-wide text-maroon">
            Disclaimers
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted">
            <li>Educational only, this is not financial advice.</li>
            <li>Numbers and rules change; always verify against the current source video and law.</li>
            <li>
              Want something removed? {SITE.removalContact} We&apos;ll act in good faith.
            </li>
            {captured && <li>Catalog statistics captured {captured}.</li>}
          </ul>
        </div>
      </div>

      <div className="mt-10 flex gap-3">
        <Link
          href="/"
          className="rounded-full bg-maroon px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-maroon-deep"
        >
          Browse the library →
        </Link>
        <Link
          href="/numbers"
          className="rounded-full border border-line bg-card px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-maroon/40"
        >
          By the Numbers
        </Link>
      </div>
    </div>
  );
}
