// ── Build-mode switch ────────────────────────────────────────────────────────
// LLA_MODE=dynamic (default) → normal Next build for Vercel: server/edge features,
//   next/image optimization, ISR-ready, OG images rendered at build via the
//   opengraph-image file convention.
// LLA_MODE=static            → `output: 'export'` pure static site (host anywhere:
//   GitHub Pages, S3, any CDN). Image optimizer is off (unoptimized) since there's
//   no server; OG images are still pre-rendered to static PNGs at build time.
const MODE = process.env.LLA_MODE === "static" ? "static" : "dynamic";
const isStatic = MODE === "static";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // flip the whole app to a static export when requested
  ...(isStatic ? { output: "export" } : {}),
  images: {
    // static export can't run the on-demand optimizer → serve images as-is
    unoptimized: isStatic,
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
  env: {
    // expose the resolved mode to the app (mirrors lib/site.ts BUILD_MODE)
    LLA_MODE: MODE,
  },
};

console.log(`▸ LLA Insights building in "${MODE}" mode`);

export default nextConfig;
