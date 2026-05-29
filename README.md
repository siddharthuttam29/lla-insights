# LLA Insights

A fast, mobile-first, searchable library of the sharpest money lessons from
**Labour Law Advisor**'s YouTube catalog, distilled, topic-filtered, and
timestamped back to the source video. The LLA-branded answer to
`wtfinsights.vercel.app`.

> **Unofficial tribute.** Not affiliated with Labour Law Advisor. Every lesson
> links back to the original video (credit + traffic to the creators).

Built from the `LLA-Insights-Buildpack` brief.

---

## Stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- `fuse.js` (client search) · `framer-motion` (accordion/stagger) · `lucide-react`
- OG share images via the **`opengraph-image` file convention** (`next/og`)
- Deploys to **Vercel** (dynamic) or any static host (static export)

## Quick start

```bash
npm install
npm run seed       # generate data/{videos,insights,stats}.json from real assets
npm run dev        # http://localhost:3000
```

Production:

```bash
npm run build && npm run start
```

---

## The static ⇄ dynamic switch

One env var, `LLA_MODE`, flips the whole app between two deploy targets. Both
modes pre-render every content page (SSG) and every OG share image at build time.

| | `LLA_MODE=dynamic` (default) | `LLA_MODE=static` |
|---|---|---|
| `next build` output | server/edge build for Vercel | `output: 'export'`, pure static files in `out/` |
| `next/image` | optimized on the fly | `unoptimized` (no server) |
| OG images | pre-rendered PNGs | pre-rendered PNGs |
| Host anywhere | Vercel | GitHub Pages, S3, any CDN |

```bash
# dynamic (default), what we ship to Vercel
npm run build

# static, emits ./out you can drop on any static host
LLA_MODE=static npm run build
npx serve out
```

The switch lives in [`next.config.mjs`](next.config.mjs) (flips `output` +
`images`) and [`lib/site.ts`](lib/site.ts) (`BUILD_MODE` for app code). Set
`NEXT_PUBLIC_SITE_URL` to your domain so canonical + OG URLs are absolute.

---

## Email signup ("Jagruk Learners")

The footer form posts to `/api/subscribe` (edge route). No DB on our side, all
state lives in Resend. The route reads three env vars in this priority order:

| Env var | What it does |
|---|---|
| `RESEND_API_KEY` | Resend account key. Get one at resend.com (free 3000 emails/mo). |
| `RESEND_AUDIENCE_ID` | If set, new emails are added to a Resend Audience (mailing list). |
| `RESEND_NOTIFY_EMAIL` | If `AUDIENCE_ID` is missing, each signup is forwarded to this address. |
| `RESEND_FROM` | Optional. Defaults to `onboarding@resend.dev` (Resend's shared sender). |

Until you add `RESEND_API_KEY` in Vercel → Project → Settings → Environment
Variables, the form gracefully falls back to a `mailto:` link so signups still
reach you. **No code changes needed to switch from fallback to live.**

To add the env var: `vercel env add RESEND_API_KEY` (or via the dashboard),
then redeploy. To create an audience: Resend dashboard → Audiences → New →
copy the ID into `RESEND_AUDIENCE_ID`.

---

## Routes

| Route | What |
|---|---|
| `/` | Hero · Insight of the Day · By Video / By Topic views · search + filters |
| `/insight/[id]` | Single-lesson permalink (own OG image) |
| `/video/[videoId]` | One video's metadata + all its lessons, timestamped |
| `/topic/[slug]` | All lessons in a money topic |
| `/numbers` | "LLA By the Numbers", the Wrapped/stats page (screenshot bait) |
| `/about` | What this is + unofficial / not-affiliated disclaimer |
| `/sitemap.xml`, `/robots.txt` | SEO |

All `[id]/[videoId]/[slug]` routes use `generateStaticParams` → independently
shareable + SEO-indexed.

---

## The content engine

The web app just renders `data/*.json`. Those are produced two ways:

### 1. Launch seed (what's committed now)

```bash
npm run seed     # pipeline/0_seed_from_assets.mjs
```

Builds the dataset from **real** catalog analytics (`pipeline/seed-assets/…`,
pulled 2026-05-30) plus 12 vetted sample insights and a curated, accuracy-checked
expansion (118 lessons across 30 videos, all 10 topics). Catalog stats,
view/like counts, video IDs and distributions are real; `durationSec` is an
estimate; the insight takeaways are seed content the live pipeline replaces.

### 2. Live pipeline (regenerate from the full catalog)

```bash
YOUTUBE_API_KEY=xxx   npm run pull:catalog     # -> data/videos.json (2,087 videos)
                      npm run pull:transcripts # -> pipeline/.cache/transcripts/*.json
ANTHROPIC_API_KEY=xxx npm run extract          # -> data/insights.json + data/stats.json
```

See [`pipeline/README.md`](pipeline/README.md). Key facts: channel
`UCVOTBwF0vnSxMRIbfSE_K_g`, uploads playlist `UUVOTBwF0vnSxMRIbfSE_K_g`. The
official API **can't** download other channels' captions (403), stage 2 uses
the public transcript path (`youtube-transcript`, fall back to `youtubei.js`).
Commit the regenerated `data/*.json`; the app needs no backend.

### Data contracts

`Insight`, `Video`, `Stats` are typed in [`lib/types.ts`](lib/types.ts) and are
the contract between the pipeline and the UI.

---

## Design system

LLA brand, deep **maroon `#7A1E1E`** + warm **cream `#FBF6EE`**, **Anton**
condensed display type + **Inter** body. Tokens in
[`tailwind.config.ts`](tailwind.config.ts); full rationale in the buildpack's
`DESIGN-SYSTEM.md`.

## Legal / ethical

Unofficial fan project. Insights are transformative summaries in our own words;
quotes are short (<20 words) and attributed; whole transcripts are never
reproduced; every card deep-links to the source. "Educational only, not
financial advice." See `/about`.
