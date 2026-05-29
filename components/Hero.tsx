import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { compactNumber } from "@/lib/format";
import type { Stats } from "@/lib/types";

// Maroon gradient hero (BUILD-SPEC §6.5), two-column: copy left, hosts right.
// The right panel auto-uses /public/hero-hosts.jpg if present, else renders a
// polished on-brand host panel so the layout is never blank.
export default function Hero({
  stats,
  insightCount,
  videoCount,
}: {
  stats: Stats;
  insightCount: number;
  videoCount: number;
}) {
  const t = stats.totals;
  const yearsActive = Number(t.last_year) - Number(t.first_year);

  const hasPhoto = (() => {
    try {
      return ["jpg", "jpeg", "png", "webp"].some((ext) =>
        fs.existsSync(path.join(process.cwd(), "public", `hero-hosts.${ext}`))
      );
    } catch {
      return false;
    }
  })();
  const photoSrc = ["jpg", "jpeg", "png", "webp"]
    .map((ext) => `hero-hosts.${ext}`)
    .find((f) => {
      try {
        return fs.existsSync(path.join(process.cwd(), "public", f));
      } catch {
        return false;
      }
    });

  const chips = [
    { value: compactNumber(t.total_views), label: "views" },
    { value: t.videos.toLocaleString("en-IN"), label: "videos" },
    { value: `${yearsActive} yrs`, label: "of lessons" },
    { value: stats.channel.subscribers_approx, label: "Jagruk Janta" },
  ];

  return (
    <section className="relative overflow-hidden bg-maroon-grad text-cream">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(#FBF6EE 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20 lg:grid-cols-[1.25fr_0.85fr]">
        {/* ── copy ── */}
        <div>
          <span className="eyebrow">Every video · Every lesson · No fluff</span>

          <h1 className="mt-5 max-w-[16ch] font-display text-hero uppercase">
            Everything LLA taught India about money.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream/85 sm:text-lg">
            <strong className="font-semibold text-cream">
              {insightCount.toLocaleString("en-IN")}+
            </strong>{" "}
            money lessons from{" "}
            <strong className="font-semibold text-cream">{videoCount}+</strong> Labour Law
            Advisor videos, distilled, searchable, and free. Made for people who&apos;d rather
            get <span className="text-gold">Jagruk</span> than scroll.
          </p>

          <dl className="mt-8 flex flex-wrap gap-2.5">
            {chips.map((c) => (
              <div
                key={c.label}
                className="flex items-baseline gap-2 rounded-full border border-cream/20 bg-cream/5 px-4 py-2 backdrop-blur-sm"
              >
                <dt className="sr-only">{c.label}</dt>
                <dd className="font-display text-xl leading-none text-gold">{c.value}</dd>
                <span className="text-[0.72rem] uppercase tracking-wide text-cream/70">
                  {c.label}
                </span>
              </div>
            ))}
          </dl>
        </div>

        {/* ── hosts panel ── */}
        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-cream/15 bg-maroon-deep shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]">
            {/* dotted halo */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "radial-gradient(#E0A33E 1.1px, transparent 1.1px)",
                backgroundSize: "16px 16px",
                maskImage: "radial-gradient(circle at 50% 38%, black, transparent 62%)",
              }}
            />
            {hasPhoto && photoSrc ? (
              <Image
                src={`/${photoSrc}`}
                alt="Labour Law Advisor hosts: Jagruk RJ and Money Minded Mandeep"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 420px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 grid grid-rows-[1fr_auto] p-5">
                <div className="flex items-start justify-between">
                  <span className="meta-label text-cream/60">The Hosts</span>
                  <span className="rounded-full border border-gold/40 px-2 py-0.5 text-[0.6rem] uppercase tracking-widest text-gold">
                    LLA
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="inline-block bg-ink/85 px-3 py-1.5">
                    <span className="font-display text-2xl uppercase tracking-tight text-cream">
                      Jagruk RJ
                    </span>
                  </div>
                  <div className="block">
                    <span className="inline-block bg-ink/85 px-3 py-1.5 font-display text-2xl uppercase tracking-tight text-cream">
                      Money Minded Mandeep
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* caption ribbon */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-4 py-1.5 font-display text-sm uppercase tracking-wide text-maroon-deep shadow-lg">
            We make India Jagruk
          </div>
        </div>
      </div>
    </section>
  );
}
