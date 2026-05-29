# Pipeline, content generation

These scripts generate the `data/*.json` the web app renders. Run offline, commit
the output. The app itself needs no backend.

## Stage 0, Launch seed (no keys needed)

```bash
npm run seed     # node pipeline/0_seed_from_assets.mjs
```

Builds `data/{videos,insights,stats}.json` from `seed-assets/lla_analytics_summary.json`
(real catalog pull, 2026-05-30) + 12 vetted sample insights + a curated expansion.
This is what ships before the live pipeline runs. **Real:** catalog totals,
view/like/comment counts, video IDs, by-year + topic distributions, top lists.
**Seed/estimated:** per-video `durationSec`, the insight takeaways.

## Live pipeline (regenerate from the full catalog)

```bash
npm i youtube-transcript p-limit     # already in devDependencies

# 1) catalog + stats  (free YouTube Data API v3 key)
YOUTUBE_API_KEY=xxx node pipeline/1_pull_catalog.mjs        # -> data/videos.json

# 2) transcripts (no key; public timedtext)
node pipeline/2_pull_transcripts.mjs                        # -> .cache/transcripts/*.json

# 3) LLM extraction
ANTHROPIC_API_KEY=xxx node pipeline/3_extract_insights.mjs  # -> data/insights.json + data/stats.json
```

### Key facts the scripts encode
- Channel `UCVOTBwF0vnSxMRIbfSE_K_g`; uploads playlist `UUVOTBwF0vnSxMRIbfSE_K_g`.
- ~2,087 videos; process **long-form first** (~603), highest-views first, to ship fast.
- **Captions constraint:** the official API returns **403** on other channels'
  captions. Stage 2 uses the unofficial public transcript (`youtube-transcript`,
  fall back to `youtubei.js`). Try `en`/`en-IN`, then `hi` (LLA is Hinglish).
- Everything checkpoints to `.cache/` so re-runs resume.

### Tuning
- `2_pull_transcripts.mjs`: cap the launch batch with `.slice(0,150)` on `targets`.
- `3_extract_insights.mjs`: edit `SYSTEM` (English vs Hinglish), swap `callLLM` for
  OpenAI, add a post-gen quality filter (drop generic takeaways, see BUILD-SPEC §5.3).
- Wire a monthly GitHub Action to re-run and PR fresh data (LLA ships ~30 videos/mo).

### No API key at all?
Replace stage 1 with `youtubei.js` (InnerTube) to list uploads + read stats
without a key. Same `data/videos.json` shape.

## After regenerating

```bash
npm run build    # picks up the new data/*.json
```
