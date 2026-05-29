import Link from "next/link";
import { stats } from "@/lib/data";
import { SITE } from "@/lib/site";
import EmailSignup from "./EmailSignup";

// Footer carries the legal/ethical disclaimers (BUILD-SPEC §10), the
// "Jagruk Learners" signup, and the freshness date.
export default function Footer() {
  const captured = stats.totals && stats._meta?.captured;
  return (
    <footer className="mt-20 border-t border-line bg-maroon-grad text-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-[1.2fr_auto_1fr] sm:items-start">
          <div className="max-w-md">
            <p className="font-display text-2xl tracking-tight">LLA INSIGHTS</p>
            <p className="mt-3 text-sm leading-relaxed text-cream/80">
              An <strong className="font-semibold text-cream">unofficial</strong>, fan-made
              library of money lessons from Labour Law Advisor. Every lesson links back to
              the original video, all credit and traffic goes to the creators.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-1">
            <Link href="/" className="text-cream/80 hover:text-cream">Home</Link>
            <Link href="/numbers" className="text-cream/80 hover:text-cream">By the Numbers</Link>
            <Link href="/about" className="text-cream/80 hover:text-cream">About</Link>
            <a
              href={SITE.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/80 hover:text-cream"
            >
              LLA on YouTube ↗
            </a>
          </nav>

          <div>
            <EmailSignup />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-cream/15 pt-6 text-xs text-cream/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Unofficial · not affiliated with Labour Law Advisor. Educational only, not
            financial advice.
          </p>
          <p>
            {captured ? `Catalog data as of ${captured}.` : null} Built with respect for{" "}
            {SITE.hosts}.
          </p>
        </div>
      </div>
    </footer>
  );
}
