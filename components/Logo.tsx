import Link from "next/link";

// JSX lockup so it adapts to its background (cream "INSIGHTS" on the maroon
// header, ink on light pages). The SVG file in /public is for OG/favicon use.
export default function Logo({
  variant = "onMaroon",
  withSublabel = false,
}: {
  variant?: "onMaroon" | "onCream";
  withSublabel?: boolean;
}) {
  const onMaroon = variant === "onMaroon";
  return (
    <Link
      href="/"
      aria-label="LLA Insights, home"
      className="group inline-flex items-center gap-2.5 rounded-lg focus-visible:ring-brand"
    >
      {/* maroon (or cream-outline) mark with LLA + hammer tick */}
      <span
        className={`relative grid h-9 w-9 place-items-center rounded-lg font-display text-[1.35rem] leading-none ${
          onMaroon ? "bg-cream text-maroon" : "bg-maroon text-cream"
        }`}
      >
        <span className="-mt-0.5 tracking-tighter">LLA</span>
        {/* hammer tick */}
        <span
          aria-hidden
          className="absolute -right-0.5 -top-1 h-2.5 w-2.5 rotate-[18deg] rounded-[2px] bg-gold"
        />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`font-display text-xl tracking-tight ${
            onMaroon ? "text-cream" : "text-ink"
          }`}
        >
          INSIGHTS
        </span>
        {withSublabel && (
          <span
            className={`mt-1 text-[0.6rem] uppercase tracking-[0.16em] ${
              onMaroon ? "text-cream/60" : "text-muted"
            }`}
          >
            The LLA Money Library · Unofficial
          </span>
        )}
      </span>
    </Link>
  );
}
