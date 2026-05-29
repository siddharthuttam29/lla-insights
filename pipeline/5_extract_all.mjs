// pipeline/5_extract_all.mjs
// REAL extraction across EVERY long-form video in data/videos.json:
//   public transcript -> Gemini 2.5 Flash -> insights, with em/en dash scrub.
// Appends to pipeline/seed-assets/extracted.json (de-duped by videoId). The
// 0_seed_from_assets.mjs merger then PREFERS extracted insights over curated.
//
// Run:  GEMINI_API_KEY=xxx node pipeline/5_extract_all.mjs

import fs from "node:fs";
import path from "node:path";
import pLimit from "p-limit";
import { YoutubeTranscript } from "youtube-transcript";

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("Set GEMINI_API_KEY"); process.exit(1); }

const ROOT = path.resolve(".");
const CACHE = path.join(ROOT, "pipeline/.cache/transcripts");
const OUT = path.join(ROOT, "pipeline/seed-assets/extracted.json");
fs.mkdirSync(CACHE, { recursive: true });

// `gemini-flash-latest` is Google's auto-tracking alias for the currently
// recommended Flash tier (currently 2.5; rolls forward to 3.x as Google
// promotes new versions). Pin a concrete model via GEMINI_MODEL if you need
// reproducibility (e.g. "gemini-2.5-flash", "gemini-3.1-flash-lite").
const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const TOPICS = ["Tax","Investing","Insurance","Salary & PF","Credit & Loans","Banking","Business & Startup","Real Estate","Govt Schemes","Money Mindset"];

const SYSTEM = `You are an expert financial editor for India. You are given the transcript of a
Labour Law Advisor (LLA) YouTube video. LLA teaches practical Indian personal finance.
Extract the 6 to 9 most valuable, standalone INSIGHTS a viewer should remember.

For EACH insight return:
- "takeaway": one crisp self-contained lesson in plain English (max ~32 words). Must make
  sense WITHOUT watching the video. Action or fact oriented.
- "quote": optional short transcript line (<18 words), original language.
- "topic": exactly one of ${JSON.stringify(TOPICS)}.
- "offsetSec": integer seconds, from the nearest (t=NN) marker in the transcript.
- "tags": 1 to 3 short keyword tags.

Hard rules:
- Be accurate to the transcript. Never invent numbers, rules, or schemes.
- No fluff, no "in this video". Each takeaway is portable money advice.
- Do NOT use em dashes or en dashes. Use commas, periods, or hyphens only.
Return STRICT JSON only: { "insights": [ ... ] }.`;

// Source = (videos already in the app) ∪ (new top-views candidates pulled fresh
// from the LLA catalog into pipeline/seed-assets/new_videos.json). The seed
// merger picks up any new IDs that get extractions and registers them.
const allVideos = JSON.parse(fs.readFileSync(path.join(ROOT, "data/videos.json"), "utf8"));
const fromApp = allVideos.filter((v) => !v.isShort);
const NEW_PATH = path.join(ROOT, "pipeline/seed-assets/new_videos.json");
const newCands = fs.existsSync(NEW_PATH)
  ? (() => {
      const j = JSON.parse(fs.readFileSync(NEW_PATH, "utf8"));
      return [...(j.primary || []), ...(j.fallback || [])]
        .filter((v) => v.id && !v.id.endsWith("_placeholder"))
        .map((v) => ({ ...v, isShort: false }));
    })()
  : [];
const seen = new Set();
const VIDEOS = [...fromApp, ...newCands].filter((v) => {
  if (seen.has(v.id)) return false;
  seen.add(v.id);
  return true;
});
console.log(`source: ${fromApp.length} in-app + ${newCands.length} new candidates = ${VIDEOS.length} unique`);

// Load existing extracted.json so we only spend tokens on new videos.
let existing = { videos: [], insights: [] };
if (fs.existsSync(OUT)) existing = JSON.parse(fs.readFileSync(OUT, "utf8"));
const have = new Set(existing.videos.map((v) => v.id));

async function getTranscript(id) {
  const cf = path.join(CACHE, `${id}.json`);
  if (fs.existsSync(cf)) {
    const c = JSON.parse(fs.readFileSync(cf, "utf8"));
    if (c.segments?.length) return c.segments;
    if (c.note === "disabled") return null; // negative-cache hit
  }
  for (const L of ["en", "en-IN", "hi"]) {
    try {
      const t = await YoutubeTranscript.fetchTranscript(id, { lang: L });
      if (t?.length) {
        const segments = t.map((s) => ({ text: s.text, offsetMs: Math.round(s.offset) }));
        fs.writeFileSync(cf, JSON.stringify({ videoId: id, lang: L, segments }));
        return segments;
      }
    } catch { /* try next */ }
  }
  fs.writeFileSync(cf, JSON.stringify({ videoId: id, segments: [], note: "disabled" }));
  return null;
}

function anchoredText(segments) {
  return segments
    .map((s, i) => (i % 10 === 0 ? `(t=${Math.round(s.offsetMs / 1000)}) ${s.text}` : s.text))
    .join(" ")
    .slice(0, 32000);
}

function nearestOffset(segments, approx) {
  let best = segments[0]?.offsetMs ?? 0, d = Infinity;
  for (const s of segments) {
    const diff = Math.abs(s.offsetMs / 1000 - approx);
    if (diff < d) { d = diff; best = s.offsetMs; }
  }
  return Math.round(best / 1000);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const scrub = (s = "") => s.replace(/\s*[—–]\s*/g, ", ").replace(/, ,/g, ",").trim();

async function gemini(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: [{ role: "user", parts: [{ text: `TRANSCRIPT:\n${text}` }] }],
    generationConfig: { temperature: 0.3, responseMimeType: "application/json", maxOutputTokens: 8192 },
  };
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const t = await res.text();
        if (res.status === 429 || res.status >= 500) {
          if (attempt === 2) console.error(`  gemini ${res.status}: ${t.slice(0, 120)}`);
          await sleep(5000 * (attempt + 1));
          continue;
        }
        throw new Error(`Gemini ${res.status}: ${t.slice(0, 200)}`);
      }
      const d = await res.json();
      const txt = d?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "{}";
      const m = txt.match(/\{[\s\S]*\}/);
      return JSON.parse(m ? m[0] : txt).insights || [];
    } catch (e) {
      if (attempt === 2) { console.error("  gemini failed:", e.message); return []; }
      await sleep(5000 * (attempt + 1));
    }
  }
  return [];
}

const limit = pLimit(2);
const newVideos = [];
const newInsights = [];
let okCount = 0, skipCount = 0, noneCount = 0;

await Promise.all(
  VIDEOS.map((v) =>
    limit(async () => {
      if (have.has(v.id)) { skipCount++; return; }
      const segs = await getTranscript(v.id);
      if (!segs) { noneCount++; console.log(`${v.id}: no transcript (${v.title.slice(0, 40)})`); return; }
      const raw = await gemini(anchoredText(segs));
      const clean = raw
        .filter((r) => r?.takeaway && r.takeaway.length > 12)
        .map((r) => ({
          videoId: v.id,
          takeaway: scrub(r.takeaway),
          quote: r.quote ? scrub(r.quote) : undefined,
          topic: TOPICS.includes(r.topic) ? r.topic : v.topic,
          tags: Array.isArray(r.tags) ? r.tags.slice(0, 3) : [],
          offsetSec: nearestOffset(segs, Number(r.offsetSec) || 0),
        }));
      if (clean.length) {
        newInsights.push(...clean);
        newVideos.push({
          id: v.id, title: v.title, publishedAt: v.publishedAt,
          views: v.views, likes: v.likes, comments: v.comments,
          durationSec: v.durationSec, topic: v.topic, isShort: false,
        });
        okCount++;
        console.log(`${v.id}: ${clean.length} insights (${v.title.slice(0, 44)})`);
      }
    })
  )
);

const merged = {
  videos: [...existing.videos, ...newVideos],
  insights: [...existing.insights, ...newInsights],
};
fs.writeFileSync(OUT, JSON.stringify(merged, null, 2));
console.log(`\nrun summary: ok=${okCount} skip=${skipCount} no-transcript=${noneCount}`);
console.log(`extracted.json now has ${merged.insights.length} insights from ${merged.videos.length} videos`);
