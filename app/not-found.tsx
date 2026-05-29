import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center sm:px-6">
      <p className="font-display text-hero leading-none text-maroon">404</p>
      <h1 className="mt-4 font-display text-2xl uppercase text-ink">Lesson not found</h1>
      <p className="mt-2 text-muted">
        That page doesn&apos;t exist, but {`there's`} 80+ money lessons that do.
      </p>
      <div className="mt-8 flex gap-3">
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
