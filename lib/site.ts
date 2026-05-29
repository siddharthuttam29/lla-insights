// Central site config + the static⇄dynamic BUILD-MODE switch.
//
// LLA_MODE controls how the app is built/served:
//   • "dynamic" (default), normal Next build for Vercel. Edge OG image route
//     (/api/og) ships, next/image optimization is on, sitemap/robots are live.
//   • "static", `output: 'export'` pure static site you can host anywhere
//     (GitHub Pages, S3, any CDN). No server: OG images fall back to a prebuilt
//     PNG, images are unoptimized, the /api/og route is excluded.
//
// next.config.mjs reads the same env var to flip `output`/`images`.
// This module exposes it to app code so components can branch on capability.

export type BuildMode = "dynamic" | "static";

export const BUILD_MODE: BuildMode =
  process.env.LLA_MODE === "static" ? "static" : "dynamic";

export const IS_STATIC = BUILD_MODE === "static";
export const IS_DYNAMIC = BUILD_MODE === "dynamic";

// Public base URL (used for canonical links + absolute OG image URLs).
// Vercel sets VERCEL_URL automatically on deploys.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "http://localhost:3000"
).replace(/\/$/, "");

export const SITE = {
  name: "LLA Insights",
  tagline: "Everything Labour Law Advisor taught India about money.",
  description:
    "A searchable, free library of the sharpest money lessons from Labour Law Advisor's YouTube catalog, distilled, topic-filtered, and timestamped to the source. Unofficial tribute.",
  // Short hero sub-line; the live insight count is injected at render time.
  channelHandle: "@LabourLawAdvisor",
  channelUrl: "https://www.youtube.com/@labourlawadvisor",
  hosts: "Rishabh Jain (Jagruk RJ) & Mandeep Gill (Money Minded Mandeep)",
  removalContact: "Open an issue on the project repo to request removal.",
} as const;

// NOTE: OG images are produced by the file-convention generators
// (app/opengraph-image.tsx + app/insight/[id]/opengraph-image.tsx). Next
// pre-renders them at build time, so they work in BOTH dynamic and static
// (output: export) modes with no per-mode branching needed here.
