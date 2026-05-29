// pipeline/3_extract_insights.mjs
// Turn transcripts -> data/insights.json (+ data/stats.json) using an LLM.
// Run: ANTHROPIC_API_KEY=xxx node pipeline/3_extract_insights.mjs
// (OpenAI works too — swap the callLLM impl.)

import fs from "node:fs";
import path from "node:path";
import pLimit from "p-limit";

const VIDEOS = JSON.parse(fs.readFileSync("data/videos.json","utf8"));
const CACHE = path.resolve("pipeline/.cache/transcripts");
const OUT_INSIGHTS = path.resolve("data/insights.json");
const OUT_STATS = path.resolve("data/stats.json");

const SYSTEM = `You are an expert financial editor for India. You are given the transcript of a
Labour Law Advisor (LLA) YouTube video. LLA teaches practical Indian personal finance
(tax, PF/EPF, mutual funds, insurance, credit cards, home loans, NPS, scams to avoid).
Extract the 6-10 most valuable, standalone INSIGHTS a viewer should remember.
For EACH insight return: takeaway (<=30 words, self-contained, action/fact oriented, must
make sense without the video), quote (optional <20 words, original language, in quotes),
topic (one of: Tax, Investing, Insurance, "Salary & PF", "Credit & Loans", Banking,
"Business & Startup", "Real Estate", "Govt Schemes", "Money Mindset"), offsetSec (int seconds,
from nearest segment), tags (1-3 short keywords).
Rules: no fluff, no "in this video", be accurate to transcript, never invent numbers/rules,
prefer concrete/surprising/money-saving points. Return STRICT JSON: { "insights": [ ... ] }.`;

async function callLLM(transcriptText) {
  // Anthropic Messages API
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{ role: "user", content: `TRANSCRIPT:\n${transcriptText.slice(0, 60000)}` }],
    }),
  });
  const d = await res.json();
  const txt = d?.content?.[0]?.text || "{}";
  const m = txt.match(/\{[\s\S]*\}/);
  try { return JSON.parse(m ? m[0] : txt).insights || []; } catch { return []; }
}

function transcriptToText(segments) {
  // join, keeping a rough time anchor every ~30s for offset mapping
  return segments.map(s => s.text).join(" ");
}
function nearestOffsetSec(segments, approxSec) {
  if (!segments.length) return approxSec || 0;
  let best = segments[0], bestD = Infinity;
  for (const s of segments) { const d = Math.abs(s.offsetMs/1000 - approxSec); if (d < bestD){bestD=d;best=s;} }
  return Math.round(best.offsetMs/1000);
}

const limit = pLimit(3);
const byId = Object.fromEntries(VIDEOS.map(v => [v.id, v]));
const all = [];

const transcriptFiles = fs.existsSync(CACHE) ? fs.readdirSync(CACHE).filter(f=>f.endsWith(".json")) : [];
await Promise.all(transcriptFiles.map(f => limit(async () => {
  const t = JSON.parse(fs.readFileSync(path.join(CACHE, f), "utf8"));
  if (!t.segments?.length) return;
  const v = byId[t.videoId]; if (!v) return;
  const insights = await callLLM(transcriptToText(t.segments));
  insights.forEach((ins, i) => {
    const offsetSec = nearestOffsetSec(t.segments, ins.offsetSec || 0);
    all.push({
      id: `${v.id}-${i}`,
      videoId: v.id,
      takeaway: ins.takeaway,
      quote: ins.quote || undefined,
      topic: ins.topic || v.topic,
      tags: Array.isArray(ins.tags) ? ins.tags.slice(0,3) : [],
      offsetSec,
      deepLink: `https://youtu.be/${v.id}?t=${offsetSec}`,
      videoTitle: v.title,
      thumb: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
      videoViews: v.views,
      publishedAt: v.publishedAt,
    });
  });
  v.insightCount = (v.insightCount||0) + insights.length;
})));

// drop empties / obvious junk
const cleaned = all.filter(x => x.takeaway && x.takeaway.length > 12);
fs.writeFileSync(OUT_INSIGHTS, JSON.stringify(cleaned, null, 0));

// stats.json (mirror of assets/data/lla_analytics_summary.json shape)
const longform = VIDEOS.filter(v=>!v.isShort), shorts = VIDEOS.filter(v=>v.isShort);
const sum = (a,k)=>a.reduce((s,x)=>s+(x[k]||0),0);
const byTopic = {};
for (const v of longform){ byTopic[v.topic] ??= {count:0,views:0}; byTopic[v.topic].count++; byTopic[v.topic].views+=v.views; }
const byYear = {};
for (const v of VIDEOS){ const y=(v.publishedAt||"").slice(0,4); if(!y)continue; byYear[y]??={count:0,views:0}; byYear[y].count++; byYear[y].views+=v.views; }
const stats = {
  totals: { videos: VIDEOS.length, longform: longform.length, shorts: shorts.length,
    total_views: sum(VIDEOS,"views"), total_likes: sum(VIDEOS,"likes"), total_comments: sum(VIDEOS,"comments"),
    total_insights: cleaned.length, total_runtime_sec: sum(VIDEOS,"durationSec") },
  topics: Object.entries(byTopic).map(([topic,o])=>({topic,...o})).sort((a,b)=>b.count-a.count),
  byYear: Object.entries(byYear).map(([year,o])=>({year,...o})).sort((a,b)=>a.year.localeCompare(b.year)),
  topLongform: longform.sort((a,b)=>b.views-a.views).slice(0,30).map(v=>({id:v.id,title:v.title,views:v.views,topic:v.topic})),
  topShorts: shorts.sort((a,b)=>b.views-a.views).slice(0,20).map(v=>({id:v.id,title:v.title,views:v.views})),
};
fs.writeFileSync(OUT_STATS, JSON.stringify(stats, null, 2));
// re-write videos.json with insightCount filled
fs.writeFileSync("data/videos.json", JSON.stringify(VIDEOS, null, 0));
console.log("insights:", cleaned.length, "-> ", OUT_INSIGHTS);
