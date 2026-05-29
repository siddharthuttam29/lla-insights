// pipeline/4_extract_recent.mjs
// REAL extraction for a curated set of recent (2026) LLA videos:
//   transcript (unofficial public captions) -> Gemini -> insights.
// Video IDs + metadata here were pulled live via the connected YouTube account.
// Writes pipeline/seed-assets/extracted.json, which 0_seed_from_assets.mjs merges.
//
// Run:  GEMINI_API_KEY=xxx node pipeline/4_extract_recent.mjs

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

const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

// Recent LLA videos (REAL stats + durations, pulled 2026-05-30).
const VIDEOS = [
  { id: "0D5AZcwK3I8", title: "I thought Rooftop Solar means 0 electricity bill..", topic: "Money Mindset", views: 930762, likes: 27469, comments: 3181, durationSec: 2204, publishedAt: "2026-04-24T12:45:01Z" },
  { id: "xGjdLbt3JUw", title: "Budget 2026 EXPLAINED in just 10 minutes", topic: "Tax", views: 565561, likes: 18553, comments: 1224, durationSec: 788, publishedAt: "2026-02-01T15:06:25Z" },
  { id: "dm5WGPmZXDM", title: "NPS just got a Major UPGRADE | NPS 3.0 vs NPS 2.0", topic: "Investing", views: 363890, likes: 6598, comments: 664, durationSec: 913, publishedAt: "2026-04-28T13:31:04Z" },
  { id: "cE0n-fI5t-4", title: "50 Loan Terms That Can Save You Lakhs!", topic: "Credit & Loans", views: 239703, likes: 7841, comments: 599, durationSec: 1189, publishedAt: "2026-05-21T13:30:27Z" },
  { id: "iNp02zXy748", title: "New Income Tax Rules 2025: The 7 Major Changes You MUST Know", topic: "Tax", views: 175276, likes: 3767, comments: 368, durationSec: 733, publishedAt: "2026-05-05T13:30:51Z" },
  { id: "hjpna_RKXMA", title: "Bought my Dream Car on CREDIT CARD", topic: "Credit & Loans", views: 147917, likes: 5147, comments: 565, durationSec: 991, publishedAt: "2026-02-28T16:24:22Z" },
  { id: "ajjPurSStdw", title: "0% GST on Life/Health Insurance Premiums, but you will PAY MORE!", topic: "Insurance", views: 163313, likes: 6144, comments: 454, durationSec: 621, publishedAt: "2025-09-20T16:17:37Z" },
  { id: "YhFA9c3ByKY", title: "17 Mistakes to AVOID in every Job | Employers hide these from you!", topic: "Salary & PF", views: 102780, likes: 4585, comments: 373, durationSec: 1252, publishedAt: "2026-01-29T14:34:54Z" },
];

const TOPICS = ["Tax","Investing","Insurance","Salary & PF","Credit & Loans","Banking","Business & Startup","Real Estate","Govt Schemes","Money Mindset"];

const SYSTEM = `You are an expert financial editor for India. You are given the transcript of a
Labour Law Advisor (LLA) YouTube video. LLA teaches practical Indian personal finance.
Extract the 6 to 9 most valuable, standalone INSIGHTS a viewer should remember.

For EACH insight return an object with:
- "takeaway": one crisp, self-contained lesson in plain English (max ~32 words). It must make
  sense WITHOUT watching the video. Action or fact oriented.
- "quote": (optional) a short representative line from the transcript (<18 words), original language.
  Omit if none is clean.
- "topic": exactly one of ${JSON.stringify(TOPICS)}.
- "offsetSec": integer seconds, taken from the nearest (t=NN) marker in the transcript where this is discussed.
- "tags": 1 to 3 short keyword tags.

Hard rules:
- Be accurate to the transcript. Never invent numbers, rules, or scheme names.
- No fluff, no "in this video". Each takeaway is a portable nugget of advice.
- Do NOT use em dashes or en dashes anywhere. Use commas, periods, or hyphens only.
- Prefer concrete, surprising, or money-saving points.
Return STRICT JSON only: { "insights": [ ... ] }.`;

async function getTranscript(id) {
  const cf = path.join(CACHE, `${id}.json`);
  if (fs.existsSync(cf)) {
    const c = JSON.parse(fs.readFileSync(cf, "utf8"));
    if (c.segments?.length) return c.segments;
  }
  for (const L of ["en", "en-IN", "hi"]) {
    try {
      const t = await YoutubeTranscript.fetchTranscript(id, { lang: L });
      if (t?.length) {
        const segments = t.map((s) => ({ text: s.text, offsetMs: Math.round(s.offset) }));
        fs.writeFileSync(cf, JSON.stringify({ videoId: id, lang: L, segments }));
        return segments;
      }
    } catch { /* try next lang */ }
  }
  return null;
}

// transcript -> text with (t=NN) anchors every ~10 segments for offset grounding
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
        const errTxt = await res.text();
        if (res.status === 429 || res.status >= 500) {
          if (attempt === 2) console.error(`  gemini ${res.status} (quota/rate): ${errTxt.slice(0, 120)}`);
          await sleep(4000 * (attempt + 1));
          continue;
        }
        throw new Error(`Gemini ${res.status}: ${errTxt.slice(0, 200)}`);
      }
      const d = await res.json();
      const txt = d?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "{}";
      const m = txt.match(/\{[\s\S]*\}/);
      return JSON.parse(m ? m[0] : txt).insights || [];
    } catch (e) {
      if (attempt === 2) { console.error("  gemini failed:", e.message); return []; }
      await sleep(1500 * (attempt + 1));
    }
  }
  return [];
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sanitize = (s = "") => s.replace(/\s*[—–]\s*/g, ", ").replace(/, ,/g, ",").trim();

const limit = pLimit(2);
const allInsights = [];
const usedVideos = [];

await Promise.all(
  VIDEOS.map((v) =>
    limit(async () => {
      const segs = await getTranscript(v.id);
      if (!segs) { console.log(`${v.id}: no transcript, skipped`); return; }
      const raw = await gemini(anchoredText(segs));
      const clean = raw
        .filter((r) => r?.takeaway && r.takeaway.length > 12)
        .map((r) => ({
          videoId: v.id,
          takeaway: sanitize(r.takeaway),
          quote: r.quote ? sanitize(r.quote) : undefined,
          topic: TOPICS.includes(r.topic) ? r.topic : v.topic,
          tags: Array.isArray(r.tags) ? r.tags.slice(0, 3) : [],
          offsetSec: nearestOffset(segs, Number(r.offsetSec) || 0),
        }));
      if (clean.length) {
        allInsights.push(...clean);
        usedVideos.push({ ...v, isShort: false });
        console.log(`${v.id}: ${clean.length} insights (${v.title.slice(0, 40)})`);
      }
    })
  )
);

fs.writeFileSync(OUT, JSON.stringify({ videos: usedVideos, insights: allInsights }, null, 2));
console.log(`\nextracted ${allInsights.length} insights from ${usedVideos.length} videos -> ${path.relative(ROOT, OUT)}`);
