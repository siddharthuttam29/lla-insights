// pipeline/2_pull_transcripts.mjs
// Pull public transcripts for long-form videos -> pipeline/.cache/transcripts/<id>.json
// Run: node pipeline/2_pull_transcripts.mjs
//
// ⚠️ The official YouTube Data API CANNOT download other channels' captions (403).
// We use the unofficial public timedtext transcript via `youtube-transcript`.
// npm i youtube-transcript p-limit

import fs from "node:fs";
import path from "node:path";
import pLimit from "p-limit";
import { YoutubeTranscript } from "youtube-transcript";

const VIDEOS = JSON.parse(fs.readFileSync("data/videos.json","utf8"));
const CACHE = path.resolve("pipeline/.cache/transcripts");
fs.mkdirSync(CACHE, { recursive: true });

// v1 scope: long-form only, highest views first (ship fast, backfill later)
const targets = VIDEOS.filter(v => !v.isShort).sort((a,b)=>b.views-a.views);
// For launch you can cap: const targets = ...slice(0,150);

const limit = pLimit(4);

async function fetchOne(v) {
  const out = path.join(CACHE, `${v.id}.json`);
  if (fs.existsSync(out)) return "cached";
  let segs = null, lang = null;
  for (const L of ["en","en-IN","hi"]) {
    try {
      const t = await YoutubeTranscript.fetchTranscript(v.id, { lang: L });
      if (t?.length) { segs = t; lang = L; break; }
    } catch { /* try next */ }
  }
  if (!segs) { fs.writeFileSync(out, JSON.stringify({ videoId: v.id, lang: null, segments: [], note: "no transcript" })); return "none"; }
  const segments = segs.map(s => ({ text: s.text, offsetMs: Math.round(s.offset) }));
  fs.writeFileSync(out, JSON.stringify({ videoId: v.id, lang, segments }));
  return "ok";
}

let ok=0, none=0, cached=0;
await Promise.all(targets.map(v => limit(async () => {
  try {
    const r = await fetchOne(v);
    if (r==="ok") ok++; else if (r==="none") none++; else cached++;
  } catch (e) { none++; }
})));
console.log({ targets: targets.length, ok, none, cached });
// Tip: if youtube-transcript is flaky on some ids, fall back to youtubei.js getTranscript().
