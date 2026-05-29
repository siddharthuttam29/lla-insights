// pipeline/1_pull_catalog.mjs
// Pull LLA's full catalog -> data/videos.json
// Run: YOUTUBE_API_KEY=xxx node pipeline/1_pull_catalog.mjs
// (No key? swap to youtubei.js — see README. This version uses the official Data API v3.)

import fs from "node:fs";
import path from "node:path";

const API_KEY = process.env.YOUTUBE_API_KEY;
if (!API_KEY) { console.error("Set YOUTUBE_API_KEY"); process.exit(1); }

const CHANNEL_ID = "UCVOTBwF0vnSxMRIbfSE_K_g";
const UPLOADS = "UU" + CHANNEL_ID.slice(2); // UUVOTBwF0vnSxMRIbfSE_K_g
const OUT = path.resolve("data/videos.json");

const TOPIC_RULES = {
  Tax: ["tax","itr","gst","budget","tds","80c","regime","loot"],
  Investing: ["mutual fund","sip","stock","invest","portfolio","nps","etf","xirr","cagr","share","ipo","gold","bond","ppf"],
  Insurance: ["insurance","term plan","health insurance","lic","mediclaim","policy","premium","endowment"],
  "Salary & PF": ["salary","ctc","job","pf","provident fund","epf","gratuity","labour code","esi","hra","notice period","e-shram","eshram"],
  "Credit & Loans": ["credit card","loan","emi","cibil","debt","home loan","credit score","no cost emi"],
  Banking: ["bank","fd","fixed deposit","savings account","rbi","upi","cheque","neft"],
  "Business & Startup": ["business","startup","llp","private limited","msme","company","freelanc","revenue","profit"],
  "Real Estate": ["house","property","real estate","rent","flat","buy vs rent"],
  "Govt Schemes": ["scheme","yojana","pension","aadhaar","pan","e-dakhil","consumer forum"],
};
function classify(title="") {
  const t = title.toLowerCase();
  for (const [topic, kws] of Object.entries(TOPIC_RULES)) for (const k of kws) if (t.includes(k)) return topic;
  return "Money Mindset";
}
function isoToSec(s="") {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(s) || [];
  return (+(m[1]||0))*3600 + (+(m[2]||0))*60 + (+(m[3]||0));
}
const get = async (url) => (await fetch(url)).json();

async function listUploadIds() {
  const ids = []; let pageToken = "";
  do {
    const u = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${UPLOADS}&maxResults=50&key=${API_KEY}${pageToken?`&pageToken=${pageToken}`:""}`;
    const d = await get(u);
    for (const it of d.items||[]) { const v = it.snippet?.resourceId?.videoId; if (v) ids.push(v); }
    pageToken = d.nextPageToken || "";
  } while (pageToken);
  return [...new Set(ids)];
}

async function enrich(ids) {
  const out = [];
  for (let i=0;i<ids.length;i+=50) {
    const chunk = ids.slice(i,i+50);
    const u = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${chunk.join(",")}&key=${API_KEY}`;
    const d = await get(u);
    for (const it of d.items||[]) {
      const sn = it.snippet||{}, st = it.statistics||{}, cd = it.contentDetails||{};
      const durationSec = isoToSec(cd.duration);
      const title = sn.title||"";
      out.push({
        id: it.id, title,
        publishedAt: sn.publishedAt,
        views: +(st.viewCount||0), likes: +(st.likeCount||0), comments: +(st.commentCount||0),
        durationSec,
        isShort: (durationSec>0 && durationSec<=70) || /#llashort|#shorts?/i.test(title),
        topic: classify(title),
        thumb: `https://i.ytimg.com/vi/${it.id}/maxresdefault.jpg`,
        insightCount: 0,
      });
    }
  }
  return out;
}

const ids = await listUploadIds();
console.log("uploads:", ids.length);
const vids = await enrich(ids);
vids.sort((a,b)=> new Date(b.publishedAt)-new Date(a.publishedAt));
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(vids, null, 0));
console.log("wrote", OUT, vids.length, "videos");
