import Link from "next/link";
import { Suspense } from "react";
import Logo from "./Logo";
import SearchBox from "./SearchBox";

// Sticky maroon header: logo lockup · search · nav. (BUILD-SPEC §6.5)
export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-maroon-deep/40 bg-maroon-grad text-cream shadow-[0_2px_16px_-8px_rgba(0,0,0,0.5)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Logo variant="onMaroon" />

        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          {/* useSearchParams needs a Suspense boundary during prerender */}
          <Suspense fallback={<div className="hidden sm:block sm:w-64 lg:w-80" />}>
            <SearchBox />
          </Suspense>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/numbers"
              className="rounded-full px-3 py-2 text-[0.8rem] font-semibold uppercase tracking-wide text-cream/90 transition hover:bg-cream/10 hover:text-cream"
            >
              By the Numbers
            </Link>
            <Link
              href="/about"
              className="rounded-full px-3 py-2 text-[0.8rem] font-semibold uppercase tracking-wide text-cream/90 transition hover:bg-cream/10 hover:text-cream"
            >
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
