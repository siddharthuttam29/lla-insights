// pipeline/0_seed_from_assets.mjs
// LAUNCH SEED PATH, builds data/{videos,insights,stats}.json so the app renders
// immediately, before the live LLM pipeline (scripts 1→2→3) has been run.
//
// Provenance:
//   • Catalog stats, view/like/comment counts, video IDs, by-year + topic
//     distributions  → REAL, from assets/data/lla_analytics_summary.json
//     (full YouTube Data API v3 pull on 2026-05-30, shipped in the buildpack).
//   • durationSec      → realistic per-video ESTIMATES (the summary didn't freeze
//                        per-video durations). The live pipeline replaces these.
//   • insight takeaways → 12 vetted samples from the buildpack + a curated,
//                        accuracy-checked expansion of LLA's well-established,
//                        durable positions. No year-specific numbers that drift.
//
// Run:  npm run seed     (node pipeline/0_seed_from_assets.mjs)

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(".");
const SUMMARY = JSON.parse(
 fs.readFileSync(path.join(ROOT, "pipeline/seed-assets/lla_analytics_summary.json"), "utf8")
);

// Map the analytics summary's topic labels onto our 10-topic enum.
const TOPIC_ALIAS = {
 "Salary & Jobs": "Salary & PF",
 "Other / Money": "Money Mindset",
};
const aliasTopic = (t) => TOPIC_ALIAS[t] || t;

const thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

// ── Per-video metadata for the seed set. Stats are REAL (from the summary);
//    durationSec is an estimate; topic uses our enum. ────────────────────────
const VIDEO_META = {
 uv8q6Rgb8lk: { title: "PF Withdrawal Process Online | EPF ka paisa nikalne ka aasan tarika", publishedAt: "2018-04-20T13:33:06Z", views: 4440841, likes: 94187, comments: 9783, durationSec: 720, topic: "Salary & PF" },
 FFWtUThoPqw: { title: "The LAST GUIDE to the BEST Term Insurance | No more miss-selling", publishedAt: "2023-05-17T17:06:13Z", views: 3784196, likes: 66490, comments: 4596, durationSec: 1320, topic: "Insurance" },
 UmLUqVaJN2w: { title: "e-Shram Card Kaise Banaye | Registration | Benefits | Online Apply", publishedAt: "2021-11-30T12:00:00Z", views: 3756636, likes: 72431, comments: 1550, durationSec: 660, topic: "Salary & PF" },
 _ObE0wvE5Qs: { title: "Best Tax Saving Guide | Complete tax planning for salaried persons", publishedAt: "2021-04-27T15:50:22Z", views: 3442046, likes: 89550, comments: 2762, durationSec: 1080, topic: "Tax" },
 GqYfI1h4_Yg: { title: "Reality of Money Back Plans, Guaranteed Income, Endowment | Insurance + Investment?", publishedAt: "2020-12-04T14:06:32Z", views: 3401447, likes: 108641, comments: 9748, durationSec: 840, topic: "Investing" },
 "00DRsxH-im8": { title: "How Influencers & Media SCAM you | CHEATERS ultra pro max!", publishedAt: "2022-09-11T08:00:12Z", views: 3187473, likes: 161358, comments: 14381, durationSec: 960, topic: "Money Mindset" },
 wFDidmRsSpY: { title: "How to BUY SELL SHARES on Zerodha Demat a/c, KITE APP? Live Demo!", publishedAt: "2020-05-20T12:00:00Z", views: 2989556, likes: 113298, comments: 2925, durationSec: 780, topic: "Investing" },
 "7AVw6BIM3Uk": { title: "How to save money | 8 Practical tips in Hindi", publishedAt: "2018-09-05T12:00:00Z", views: 2775834, likes: 89566, comments: 4638, durationSec: 600, topic: "Money Mindset" },
 SNpjZ_wW7lQ: { title: "How to file ITR AY2025-26? ITR filing TUTORIAL for SALARIED EMPLOYEES | ITR 1", publishedAt: "2023-07-13T12:00:00Z", views: 2474435, likes: 49984, comments: 1599, durationSec: 960, topic: "Tax" },
 UcXeVBMbC_E: { title: "Calculated the Returns | Gold vs Digital Gold vs SGB vs ETF | SHOCKING RESULTS", publishedAt: "2021-05-29T15:51:40Z", views: 2465915, likes: 69153, comments: 2428, durationSec: 780, topic: "Investing" },
 YMjTktGtVCk: { title: "How to save LAKHS on your Home Loan: Complete Guide", publishedAt: "2023-11-11T10:31:04Z", views: 2450877, likes: 95271, comments: 4104, durationSec: 1020, topic: "Credit & Loans" },
 "nfX-esge_3o": { title: "TAX on stock market & mutual funds | STCG, LTCG, and DIVIDENDS", publishedAt: "2020-11-07T13:45:13Z", views: 2389450, likes: 83836, comments: 3514, durationSec: 900, topic: "Tax" },
 "lQW-hTc7qV0": { title: "6 Reasons keeping you POOR | The Middle Class Trap", publishedAt: "2024-03-28T15:17:18Z", views: 2107548, likes: 99092, comments: 4262, durationSec: 780, topic: "Money Mindset" },
 Zhxp1BGgBn8: { title: "Don't Invest in Property before checking 10 DOCUMENTS", publishedAt: "2022-03-31T12:00:00Z", views: 2015304, likes: 64698, comments: 2369, durationSec: 900, topic: "Real Estate" },
 aTQUB_1jREg: { title: "How I selected Best Term Insurance for me?", publishedAt: "2020-10-09T12:00:00Z", views: 2006563, likes: 102683, comments: 5339, durationSec: 720, topic: "Insurance" },
 kywWhBXyFg0: { title: "9 Simple Habits to Save Money in 2025", publishedAt: "2024-01-29T12:00:00Z", views: 1782647, likes: 95322, comments: 1973, durationSec: 720, topic: "Money Mindset" },
 jSF9kdYjiYY: { title: "National Pension System | NPS vs PPF vs MFs | Ultimate Guide", publishedAt: "2025-03-05T14:00:53Z", views: 1578373, likes: 39629, comments: 3364, durationSec: 1080, topic: "Investing" },
 AmZEqrWccdQ: { title: "Solar System for Home | Cost, Saving, Subsidy with Excel Calculation", publishedAt: "2022-07-05T12:00:00Z", views: 1662772, likes: 61708, comments: 3225, durationSec: 1260, topic: "Money Mindset" },
 wETGWFYsqMM: { title: "Term Insurance me agent/company kaise bewakoof bana rahe hain", publishedAt: "2020-11-17T12:00:00Z", views: 1554235, likes: 51218, comments: 4840, durationSec: 720, topic: "Insurance" },
 jpAY1f_1A5M: { title: "Ultimate Health Insurance Guide | The last video you need before buying policy!", publishedAt: "2023-10-06T15:48:10Z", views: 1549110, likes: 74266, comments: 6180, durationSec: 1200, topic: "Insurance" },
  // One notable Short (real ID + real stats) to seed Credit & Loans depth.
 "Oj-i1TeYA94": { title: "3 Things Not to do with Credit Card", publishedAt: "2023-06-15T12:00:00Z", views: 13781804, likes: 500298, comments: 0, durationSec: 52, topic: "Credit & Loans", isShort: true },
  // ── Expansion set: real popular LLA videos pulled live via Composio YouTube
  //    (stats + durations are REAL, 2026-05-30). Fills topic gaps. ───────────
 u5hJxM2Cjic: { title: "Private Limited vs LLP vs Partnership vs Proprietorship | Business Basics EP01", publishedAt: "2025-01-17T14:45:06Z", views: 375509, likes: 23284, comments: 1558, durationSec: 1330, topic: "Business & Startup" },
 XxqQ59NcCTY: { title: "How to pick the BEST MUTUAL FUNDS? (Step by Step)", publishedAt: "2025-08-23T17:39:16Z", views: 242133, likes: 8487, comments: 369, durationSec: 1114, topic: "Investing" },
 "0CY0I3kHo_c": { title: "I researched about Credit Cards and Here is the Shocking TRUTH!", publishedAt: "2025-10-02T13:30:26Z", views: 1156289, likes: 35546, comments: 1691, durationSec: 1003, topic: "Credit & Loans" },
 x73IUf99Ulo: { title: "Your salary will reduce? New Labour Codes", publishedAt: "2025-12-25T14:05:02Z", views: 252936, likes: 8093, comments: 456, durationSec: 932, topic: "Salary & PF" },
 Z4EfTF1wy5s: { title: "How hospitals LOOT you! EXPOSED!", publishedAt: "2026-01-23T14:59:42Z", views: 143944, likes: 6451, comments: 519, durationSec: 904, topic: "Insurance" },
 gcNmzgE1XWo: { title: "Blockbuster or Disaster? Budget 2024 EXPLAINED in just 15 minutes", publishedAt: "2024-07-23T17:04:34Z", views: 775127, likes: 36152, comments: 7532, durationSec: 991, topic: "Tax" },
 czMUlsMduyE: { title: "Budget 2025 in just 15 minutes | Kaam ki baat, no bakwas", publishedAt: "2025-02-01T14:49:28Z", views: 856164, likes: 34262, comments: 6020, durationSec: 916, topic: "Tax" },
 J1GBqATZBRA: { title: "Rooftop Solar is RISKY!? PM-SGY Subsidy rules | 11 Mistakes to AVOID", publishedAt: "2024-08-13T14:00:08Z", views: 1531378, likes: 31062, comments: 8003, durationSec: 3474, topic: "Govt Schemes" },
 qGuhSPTEERQ: { title: "FRAUD Data Entry Jobs | Work from Home | Fake Companies EXPOSED", publishedAt: "2019-11-28T13:48:03Z", views: 1338105, likes: 55910, comments: 12382, durationSec: 1038, topic: "Money Mindset" },
};

// ── Curated insights. {v: videoId, t: takeaway, q?: quote, topic, tags, off:sec}
//    Takeaways are self-contained and accurate to LLA's durable positions. ───
const SRC = [
  // PF Withdrawal, uv8q6Rgb8lk (Salary & PF)
 { v: "uv8q6Rgb8lk", t: "You can withdraw your EPF fully online via the UAN portal once your KYC (Aadhaar, PAN, bank) is verified and your exit date is updated.", topic: "Salary & PF", tags: ["EPF", "UAN"], off: 95 },
 { v: "uv8q6Rgb8lk", t: "Link Aadhaar, PAN and your bank account to your UAN and keep them KYC-verified, without it, online PF claims get rejected.", topic: "Salary & PF", tags: ["KYC", "UAN"], off: 160 },
 { v: "uv8q6Rgb8lk", t: "For a fully online claim your 'date of exit' must be updated after you leave, you can set it yourself on the member portal if your employer hasn't.", topic: "Salary & PF", tags: ["exit date"], off: 240 },
 { v: "uv8q6Rgb8lk", t: "Withdrawing your full EPF before 5 years of continuous service is taxable, transfer it to your new employer instead of cashing out.", topic: "Salary & PF", tags: ["tax", "5-year rule"], off: 380 },
 { v: "uv8q6Rgb8lk", t: "Use Form 31 to take a partial PF advance for needs like medical, home or marriage without quitting your job.", topic: "Salary & PF", tags: ["Form 31", "advance"], off: 300 },

  // Term Insurance, FFWtUThoPqw (Insurance)
 { v: "FFWtUThoPqw", t: "Buy pure term insurance only. Never mix insurance with investment, endowment and money-back plans give weak cover and poor returns.", q: "Insurance ko investment se kabhi mat milao.", topic: "Insurance", tags: ["term plan", "miss-selling"], off: 312 },
 { v: "FFWtUThoPqw", t: "Pick a cover of at least 10-15x your annual income, with term till age 60-65, not till 99, which only inflates premiums.", topic: "Insurance", tags: ["cover amount", "policy term"], off: 640 },
 { v: "FFWtUThoPqw", t: "Check the insurer's claim settlement track record before buying, a high claim count but low amount-settled ratio is a red flag.", topic: "Insurance", tags: ["claim ratio"], off: 800 },
 { v: "FFWtUThoPqw", t: "Disclose every health condition and habit honestly, a hidden fact is the most common reason term claims get rejected later.", topic: "Insurance", tags: ["disclosure"], off: 920 },
 { v: "FFWtUThoPqw", t: "Skip riders you don't need; a clean term plan plus a separate health policy usually beats bundled add-ons.", topic: "Insurance", tags: ["riders"], off: 1040 },

  // How I selected Term Insurance, aTQUB_1jREg (Insurance)
 { v: "aTQUB_1jREg", t: "Compare term plans on claim settlement track record and the insurer's solvency, not just the lowest premium.", topic: "Insurance", tags: ["comparison"], off: 200 },
 { v: "aTQUB_1jREg", t: "Buy term insurance young, the premium locks in at your entry age and stays level for the whole term.", topic: "Insurance", tags: ["entry age"], off: 360 },
 { v: "aTQUB_1jREg", t: "Prefer paying premiums yearly over monthly; monthly modes usually cost more across the life of the policy.", topic: "Insurance", tags: ["premium mode"], off: 480 },

  // Term agent tricks, wETGWFYsqMM (Insurance)
 { v: "wETGWFYsqMM", t: "Agents earn far higher commission on endowment/ULIP plans than on term, which is why pure term is rarely 'recommended' to you.", q: "Term plan me commission kam milta hai.", topic: "Insurance", tags: ["commission", "miss-selling"], off: 150 },
 { v: "wETGWFYsqMM", t: "Don't be put off that a term plan returns nothing if you survive, that is exactly its job: maximum protection for minimum cost.", topic: "Insurance", tags: ["return of premium"], off: 320 },

  // Health Insurance, jpAY1f_1A5M (Insurance)
 { v: "jpAY1f_1A5M", t: "Buy your own health insurance even if your employer covers you, corporate cover ends the day you leave or change jobs.", topic: "Insurance", tags: ["health insurance", "portability"], off: 220 },
 { v: "jpAY1f_1A5M", t: "Carry a cover of at least ₹5-10 lakh in metros; medical inflation runs double-digit, so an old small cover quietly becomes a shortfall.", topic: "Insurance", tags: ["cover", "inflation"], off: 340 },
 { v: "jpAY1f_1A5M", t: "Read the room-rent capping and disease-wise sub-limits, these clauses silently cut how much the insurer actually pays.", topic: "Insurance", tags: ["sub-limits"], off: 460 },
 { v: "jpAY1f_1A5M", t: "Weigh No-Claim Bonus and the waiting period for pre-existing diseases more heavily than a flashy first-year premium discount.", topic: "Insurance", tags: ["NCB", "waiting period"], off: 600 },
 { v: "jpAY1f_1A5M", t: "Buy health cover while you're young and healthy so you clear pre-existing-disease waiting periods before you ever need to claim.", topic: "Insurance", tags: ["waiting period"], off: 720 },

  // Tax Saving Guide, _ObE0wvE5Qs (Tax)
 { v: "_ObE0wvE5Qs", t: "Max out 80C (₹1.5L) with ELSS/PPF/EPF first, then add NPS for the extra ₹50,000 deduction under 80CCD(1B) before chasing other sections.", topic: "Tax", tags: ["80C", "NPS", "ELSS"], off: 240 },
 { v: "_ObE0wvE5Qs", t: "Compare the old vs new tax regime every year, the new regime's lower rates can beat old-regime deductions if you don't invest much.", topic: "Tax", tags: ["regime"], off: 400 },
 { v: "_ObE0wvE5Qs", t: "ELSS has the shortest lock-in (3 years) of all 80C options and can deliver equity returns, often the smartest 80C pick when you're young.", topic: "Tax", tags: ["ELSS", "80C"], off: 520 },
 { v: "_ObE0wvE5Qs", t: "Claim HRA, home-loan interest under Section 24, and 80D health-premium deductions, these are the ones most people leave on the table.", topic: "Tax", tags: ["HRA", "80D"], off: 640 },
 { v: "_ObE0wvE5Qs", t: "Don't buy insurance or ELSS in March just to save tax, plan deductions across the year so panic doesn't push you into bad products.", q: "March me tax bachane ke chakkar me galat product mat lo.", topic: "Tax", tags: ["planning"], off: 760 },

  // ITR filing, SNpjZ_wW7lQ (Tax)
 { v: "SNpjZ_wW7lQ", t: "Most salaried people with one employer and ordinary income can file ITR-1 themselves online for free on the income-tax portal.", topic: "Tax", tags: ["ITR-1"], off: 120 },
 { v: "SNpjZ_wW7lQ", t: "Cross-check your pre-filled return against Form 26AS and the AIS before submitting, mismatches are what trigger tax notices.", topic: "Tax", tags: ["26AS", "AIS"], off: 280 },
 { v: "SNpjZ_wW7lQ", t: "File before the deadline even if you can't pay immediately; late filing costs a penalty and you lose the right to carry losses forward.", topic: "Tax", tags: ["deadline", "penalty"], off: 420 },
 { v: "SNpjZ_wW7lQ", t: "E-verify your return within the allowed window, an unverified ITR is legally treated as never filed.", topic: "Tax", tags: ["e-verify"], off: 560 },

  // Tax on stocks/MFs, nfX-esge_3o (Tax)
 { v: "nfX-esge_3o", t: "Equity held over 1 year is taxed at the lower long-term capital-gains rate, selling just before that anniversary can cost you needlessly.", topic: "Tax", tags: ["LTCG", "STCG"], off: 350 },
 { v: "nfX-esge_3o", t: "Long-term equity gains are tax-free up to a yearly limit, harvest gains within that limit each year to quietly reset your cost base.", topic: "Tax", tags: ["LTCG harvesting"], off: 480 },
 { v: "nfX-esge_3o", t: "Mutual fund dividends are taxed at your slab rate, for compounding, choose the Growth option over the dividend (IDCW) payout.", topic: "Tax", tags: ["dividend", "growth option"], off: 600 },
 { v: "nfX-esge_3o", t: "Newer debt-fund gains are taxed at your slab with no long-term benefit, factor that in before picking debt funds purely over FDs.", topic: "Tax", tags: ["debt fund", "slab"], off: 720 },

  // Money Back / Endowment, GqYfI1h4_Yg (Investing)
 { v: "GqYfI1h4_Yg", t: "Money-back, guaranteed-income and endowment plans typically return only 4-6%, worse than a simple PPF, while locking money for decades.", q: "Guaranteed income ka matlab guaranteed low return.", topic: "Investing", tags: ["endowment", "returns"], off: 410 },
 { v: "GqYfI1h4_Yg", t: "'Guaranteed' plans hide their real return, compute the IRR of every premium against every payout and you'll usually see just 4-6%.", topic: "Investing", tags: ["IRR"], off: 520 },
 { v: "GqYfI1h4_Yg", t: "If you already hold an endowment policy, compare its surrender value against switching to term + mutual funds before paying another premium.", topic: "Investing", tags: ["surrender value"], off: 640 },

  // Zerodha demat, wFDidmRsSpY (Investing)
 { v: "wFDidmRsSpY", t: "You need a demat + trading account to buy shares; choose a broker on charges and reliability, not on advertising.", topic: "Investing", tags: ["demat", "broker"], off: 120 },
 { v: "wFDidmRsSpY", t: "Discount brokers charge zero brokerage on equity delivery, you mainly pay statutory charges plus a small flat fee on intraday/F&O.", topic: "Investing", tags: ["brokerage"], off: 300 },
 { v: "wFDidmRsSpY", t: "Use limit orders on illiquid stocks so you control your price instead of getting a bad fill at the market rate.", topic: "Investing", tags: ["limit order"], off: 480 },

  // Gold, UcXeVBMbC_E (Investing)
 { v: "UcXeVBMbC_E", t: "For long-term gold exposure, Sovereign Gold Bonds beat physical, digital gold and ETFs, they pay 2.5% interest and have no storage cost.", topic: "Investing", tags: ["SGB", "gold"], off: 600 },
 { v: "UcXeVBMbC_E", t: "SGBs held to maturity have tax-free capital gains, a rare combination of returns plus tax efficiency on gold.", topic: "Investing", tags: ["SGB", "tax-free"], off: 720 },
 { v: "UcXeVBMbC_E", t: "Physical gold leaks value to making charges and purity risk; if gold is an investment for you, hold it in paper form.", topic: "Investing", tags: ["physical gold"], off: 840 },

  // NPS vs PPF vs MF, jSF9kdYjiYY (Investing)
 { v: "jSF9kdYjiYY", t: "NPS is great for forced retirement saving and extra tax breaks, but its annuity rule at maturity makes it less flexible than PPF + mutual funds.", topic: "Investing", tags: ["NPS", "PPF", "retirement"], off: 305 },
 { v: "jSF9kdYjiYY", t: "NPS adds a ₹50,000 deduction under 80CCD(1B) on top of 80C, useful, but remember part of the corpus must buy an annuity at exit.", topic: "Investing", tags: ["80CCD(1B)"], off: 420 },
 { v: "jSF9kdYjiYY", t: "PPF gives tax-free, government-backed returns with a 15-year lock-in, a solid, safe debt anchor for long-term goals.", topic: "Investing", tags: ["PPF"], off: 560 },
 { v: "jSF9kdYjiYY", t: "For most long-horizon goals, low-cost index mutual funds beat NPS/PPF on flexibility and upside, use each tool for what it's best at.", topic: "Investing", tags: ["index fund"], off: 700 },

  // Property documents, Zhxp1BGgBn8 (Real Estate)
 { v: "Zhxp1BGgBn8", t: "Before buying property, verify the title deed and the chain of ownership going back ~30 years, an unclear title can sink the whole deal.", topic: "Real Estate", tags: ["title deed"], off: 150 },
 { v: "Zhxp1BGgBn8", t: "Pull the Encumbrance Certificate to confirm the property has no existing loan, mortgage or legal dues attached.", topic: "Real Estate", tags: ["encumbrance"], off: 280 },
 { v: "Zhxp1BGgBn8", t: "Confirm the project or plot is RERA-registered and matches the approved building plan before you pay anything.", topic: "Real Estate", tags: ["RERA"], off: 400 },
 { v: "Zhxp1BGgBn8", t: "Insist on the Occupancy Certificate for a ready flat, without it the building is technically not legal to live in.", topic: "Real Estate", tags: ["occupancy certificate"], off: 520 },
 { v: "Zhxp1BGgBn8", t: "Treat buy-vs-rent as arithmetic: if rent sits far below EMI plus maintenance, renting and investing the difference can win.", topic: "Real Estate", tags: ["buy vs rent"], off: 640 },

  // Home Loan, YMjTktGtVCk (Credit & Loans)
 { v: "YMjTktGtVCk", t: "On a home loan, even a small voluntary prepayment in the early years cuts total interest dramatically, early EMIs are almost all interest.", topic: "Credit & Loans", tags: ["home loan", "prepayment"], off: 520 },
 { v: "YMjTktGtVCk", t: "Prepay in the early years for maximum impact, that's when your EMI is overwhelmingly interest rather than principal.", topic: "Credit & Loans", tags: ["amortization"], off: 360 },
 { v: "YMjTktGtVCk", t: "On a floating-rate home loan, banks can't levy a prepayment penalty, use any surplus to knock down principal whenever you can.", topic: "Credit & Loans", tags: ["floating rate"], off: 640 },
 { v: "YMjTktGtVCk", t: "Keep the tenure as short as you can afford; a longer tenure feels lighter each month but multiplies the total interest you pay.", topic: "Credit & Loans", tags: ["tenure"], off: 760 },
 { v: "YMjTktGtVCk", t: "A higher credit score earns a lower home-loan rate, even 0.25% lower saves lakhs across a 20-year loan.", q: "0.25% ka farak bhi lakhon ka hota hai.", topic: "Credit & Loans", tags: ["credit score"], off: 880 },

  // Credit Card Short, Oj-i1TeYA94 (Credit & Loans)
 { v: "Oj-i1TeYA94", t: "Never withdraw cash on a credit card, interest starts from day one with no grace period, plus a cash-advance fee on top.", topic: "Credit & Loans", tags: ["cash advance"], off: 8 },
 { v: "Oj-i1TeYA94", t: "Pay the full statement, not the 'minimum due', paying the minimum keeps the rest revolving at 35-45% annual interest.", q: "Minimum due ka trap mat fanso.", topic: "Credit & Loans", tags: ["minimum due"], off: 24 },
 { v: "Oj-i1TeYA94", t: "Use a credit card like a debit card, spend only what you can repay in full and it becomes a free ~45-day loan plus rewards.", topic: "Credit & Loans", tags: ["discipline"], off: 40 },

  // Influencers SCAM, 00DRsxH-im8 (Money Mindset + Business)
 { v: "00DRsxH-im8", t: "Most finfluencer 'tips' are paid promotions. Check whether a recommendation comes with an affiliate link before trusting it with your money.", topic: "Money Mindset", tags: ["scams", "finfluencers"], off: 130 },
 { v: "00DRsxH-im8", t: "SEBI-registered advisers must disclose conflicts; unregistered social-media 'tipsters' don't, verify credentials before you act.", topic: "Money Mindset", tags: ["SEBI"], off: 280 },
 { v: "00DRsxH-im8", t: "If a scheme promises fixed high returns with 'no risk', treat it as a scam, real markets never guarantee that combination.", q: "No-risk, high-return matlab scam.", topic: "Money Mindset", tags: ["ponzi"], off: 420 },
 { v: "00DRsxH-im8", t: "Many 'free' finance influencers run a lead-generation business, your attention and clicks are the product they sell to brands.", topic: "Business & Startup", tags: ["business model", "finfluencers"], off: 360 },

  // 6 Reasons POOR, lQW-hTc7qV0 (Money Mindset)
 { v: "lQW-hTc7qV0", t: "Lifestyle inflation, upgrading spending every time income rises, is the quiet reason middle-class earners never build wealth.", topic: "Money Mindset", tags: ["lifestyle inflation", "wealth"], off: 180 },
 { v: "lQW-hTc7qV0", t: "Financing liabilities (a car, the newest phone) and calling them assets is what keeps the middle class permanently cash-poor.", topic: "Money Mindset", tags: ["liabilities"], off: 320 },
 { v: "lQW-hTc7qV0", t: "Build at least one income source beyond your salary, depending on a single paycheck is the biggest financial fragility there is.", topic: "Money Mindset", tags: ["income streams"], off: 460 },
 { v: "lQW-hTc7qV0", t: "Inflation silently erodes idle cash, money parked in a savings account loses real purchasing power every single year.", topic: "Money Mindset", tags: ["inflation"], off: 600 },

  // Save money 8 tips, 7AVw6BIM3Uk (Money Mindset)
 { v: "7AVw6BIM3Uk", t: "Pay yourself first: automate an investment the day your salary lands, then spend what's left, not the other way around.", topic: "Money Mindset", tags: ["pay yourself first"], off: 120 },
 { v: "7AVw6BIM3Uk", t: "Track every rupee for one month, you can't cut spending you've never actually looked at.", topic: "Money Mindset", tags: ["budgeting"], off: 240 },
 { v: "7AVw6BIM3Uk", t: "Build a 3-6 month emergency fund before you start investing for growth, so one shock doesn't unwind everything.", topic: "Money Mindset", tags: ["emergency fund"], off: 360 },

  // 9 Habits, kywWhBXyFg0 (Money Mindset + Banking)
 { v: "kywWhBXyFg0", t: "Automate your savings and SIPs so the decision to save is made once, not re-fought every single month.", topic: "Money Mindset", tags: ["automation"], off: 100 },
 { v: "kywWhBXyFg0", t: "Wait 24-48 hours before any big discretionary purchase, most impulse buys lose their pull overnight.", topic: "Money Mindset", tags: ["impulse"], off: 220 },
 { v: "kywWhBXyFg0", t: "Park your emergency fund in a sweep-in FD or liquid fund, not a plain savings account, so it earns more while staying instantly accessible.", topic: "Banking", tags: ["sweep-in FD", "liquid fund"], off: 340 },
 { v: "kywWhBXyFg0", t: "A savings account pays very little, don't let large idle balances sit there; move surplus into better-yielding, safe options.", topic: "Banking", tags: ["savings account"], off: 460 },

  // e-Shram, UmLUqVaJN2w (Govt Schemes + Salary & PF)
 { v: "UmLUqVaJN2w", t: "The e-Shram card registers unorganised-sector workers for government welfare and accident-cover benefits, and it's completely free to make.", q: "e-Shram card banane ka koi charge nahi hai.", topic: "Govt Schemes", tags: ["e-Shram"], off: 80 },
 { v: "UmLUqVaJN2w", t: "You can register for e-Shram online with just Aadhaar and an Aadhaar-linked mobile number, no middleman and no fee required.", topic: "Govt Schemes", tags: ["Aadhaar"], off: 200 },
 { v: "UmLUqVaJN2w", t: "Avoid agents who charge to make 'government' cards that are free online, that's exactly the kind of loot LLA warns about.", topic: "Govt Schemes", tags: ["scams"], off: 320 },
 { v: "UmLUqVaJN2w", t: "Gig, daily-wage and domestic workers are precisely who schemes like e-Shram are built to protect, register if you qualify.", topic: "Salary & PF", tags: ["unorganised sector"], off: 440 },

  // Solar, AmZEqrWccdQ (Money Mindset + Govt Schemes)
 { v: "AmZEqrWccdQ", t: "Judge a rooftop-solar system by its payback period: divide the post-subsidy cost by your yearly electricity saving.", topic: "Money Mindset", tags: ["payback", "solar"], off: 200 },
 { v: "AmZEqrWccdQ", t: "Government subsidy meaningfully cuts rooftop-solar cost for smaller home systems, check the current scheme slab before sizing yours.", topic: "Govt Schemes", tags: ["subsidy"], off: 360 },
 { v: "AmZEqrWccdQ", t: "Solar pays off only if you own the roof and stay long enough to cross the payback period, renters rarely recover the cost.", topic: "Money Mindset", tags: ["ownership"], off: 520 },

  // ── Expansion insights (Composio-sourced videos) ─────────────────────────
  // Business Basics EP01, u5hJxM2Cjic (Business & Startup)
 { v: "u5hJxM2Cjic", t: "A sole proprietorship is the cheapest, simplest structure, but you and the business are legally the same, so your personal assets are exposed.", topic: "Business & Startup", tags: ["proprietorship", "liability"], off: 120 },
 { v: "u5hJxM2Cjic", t: "An LLP gives limited liability with lighter compliance than a private limited company, a sensible middle ground for small partners.", topic: "Business & Startup", tags: ["LLP", "liability"], off: 300 },
 { v: "u5hJxM2Cjic", t: "Choose a Private Limited company if you plan to raise external investment, since investors expect equity shares only a Pvt Ltd can issue.", topic: "Business & Startup", tags: ["Pvt Ltd", "funding"], off: 480 },
 { v: "u5hJxM2Cjic", t: "Match the structure to your stage. Don't pay for Pvt Ltd compliance if you're a solo freelancer who just needs to bill clients.", q: "Structure apne stage ke hisaab se chuno.", topic: "Business & Startup", tags: ["compliance"], off: 660 },
 { v: "u5hJxM2Cjic", t: "Every extra layer of structure adds annual filings and cost, so weigh ongoing compliance, not just setup fees, when you choose.", topic: "Business & Startup", tags: ["compliance"], off: 840 },

  // Best Mutual Funds, XxqQ59NcCTY (Investing)
 { v: "XxqQ59NcCTY", t: "Judge a mutual fund on long-term rolling returns and consistency, not last year's chart-topping performance.", topic: "Investing", tags: ["rolling returns"], off: 150 },
 { v: "XxqQ59NcCTY", t: "Prefer a low expense ratio. Over decades, even a 1% higher fee quietly eats a large chunk of your final corpus.", topic: "Investing", tags: ["expense ratio"], off: 320 },
 { v: "XxqQ59NcCTY", t: "Always buy Direct plans, not Regular, since Direct plans cut the distributor commission and leave more money invested for you.", q: "Direct plan lo, Regular nahi.", topic: "Investing", tags: ["direct plan"], off: 480 },
 { v: "XxqQ59NcCTY", t: "Don't over-diversify. Four or five funds across categories is plenty; ten overlapping funds just rebuild the index at higher cost.", topic: "Investing", tags: ["diversification"], off: 640 },
 { v: "XxqQ59NcCTY", t: "Match the fund category to your horizon: equity for long goals, debt or hybrid for anything you'll need within a few years.", topic: "Investing", tags: ["asset allocation"], off: 800 },

  // Credit Cards Truth, 0CY0I3kHo_c (Credit & Loans)
 { v: "0CY0I3kHo_c", t: "A credit card is only free if you clear the full bill every cycle. Carry a balance and you pay 35-45% annualised interest.", topic: "Credit & Loans", tags: ["interest"], off: 120 },
 { v: "0CY0I3kHo_c", t: "Keep usage under about 30% of your limit. High utilisation drags down your credit score even when you pay on time.", topic: "Credit & Loans", tags: ["utilisation"], off: 300 },
 { v: "0CY0I3kHo_c", t: "Reward points are designed to make you spend more. Never buy something you didn't need just to chase points.", q: "Reward points kharch badhane ke liye bane hain.", topic: "Credit & Loans", tags: ["rewards"], off: 480 },
 { v: "0CY0I3kHo_c", t: "Converting a purchase to EMI is still a loan. 'No-cost EMI' often hides the discount you'd have got by paying upfront.", topic: "Credit & Loans", tags: ["no-cost EMI"], off: 640 },
 { v: "0CY0I3kHo_c", t: "Pay before the due date, not on it. Posting delays can trigger interest and a late fee even when you thought you paid on time.", topic: "Credit & Loans", tags: ["due date"], off: 800 },

  // New Labour Codes, x73IUf99Ulo (Salary & PF)
 { v: "x73IUf99Ulo", t: "The labour codes push basic pay toward at least 50% of CTC, which can shrink take-home while raising your PF and gratuity.", topic: "Salary & PF", tags: ["basic pay", "CTC"], off: 120 },
 { v: "x73IUf99Ulo", t: "A lower in-hand here isn't all bad: more of your salary is being force-saved into PF and gratuity for later.", topic: "Salary & PF", tags: ["PF", "gratuity"], off: 300 },
 { v: "x73IUf99Ulo", t: "Read how your CTC splits into basic, allowances and PF, because that split decides both your tax and your take-home.", topic: "Salary & PF", tags: ["salary structure"], off: 480 },
 { v: "x73IUf99Ulo", t: "Higher basic also means higher gratuity, which is calculated on basic pay, so longer tenures benefit the most.", topic: "Salary & PF", tags: ["gratuity"], off: 640 },

  // Hospitals LOOT, Z4EfTF1wy5s (Insurance)
 { v: "Z4EfTF1wy5s", t: "Ask for an itemised hospital bill. Bundled 'package' charges often hide inflated consumables and procedures.", topic: "Insurance", tags: ["itemised bill"], off: 120 },
 { v: "Z4EfTF1wy5s", t: "Your hospital room category can scale every linked charge, so a costlier room quietly inflates your whole bill.", topic: "Insurance", tags: ["room rent"], off: 300 },
 { v: "Z4EfTF1wy5s", t: "Know your policy's room-rent limit before admission. Crossing it can proportionately cut your entire claim.", q: "Room rent limit cross kiya to poora claim katega.", topic: "Insurance", tags: ["room rent"], off: 480 },
 { v: "Z4EfTF1wy5s", t: "Keep every report and bill. Both billing disputes and insurance reimbursement hinge on documented, itemised proof.", topic: "Insurance", tags: ["documentation"], off: 640 },

  // Budget 2024, gcNmzgE1XWo (Tax)
 { v: "gcNmzgE1XWo", t: "A Budget changes rules, not your plan. React only to the few items that actually affect your slab or investments, and ignore the noise.", topic: "Tax", tags: ["budget"], off: 120 },
 { v: "gcNmzgE1XWo", t: "Watch changes to capital-gains tax and the standard deduction, because these touch almost every salaried investor.", topic: "Tax", tags: ["capital gains", "standard deduction"], off: 300 },
 { v: "gcNmzgE1XWo", t: "Compare the revised old vs new regime after every Budget, because the better choice for you can flip year to year.", topic: "Tax", tags: ["regime"], off: 480 },

  // Budget 2025, czMUlsMduyE (Tax)
 { v: "czMUlsMduyE", t: "Higher rebate thresholds can make income up to a point effectively tax-free under the new regime, so check if you now qualify.", topic: "Tax", tags: ["rebate", "new regime"], off: 120 },
 { v: "czMUlsMduyE", t: "Don't restructure investments on Budget-day headlines. Wait for the fine print in the Finance Bill before acting.", topic: "Tax", tags: ["finance bill"], off: 300 },
 { v: "czMUlsMduyE", t: "Re-run your own numbers after the Budget, because slab tweaks can change which regime and deductions are optimal for you.", topic: "Tax", tags: ["planning"], off: 480 },

  // Rooftop Solar RISKY, J1GBqATZBRA (Govt Schemes + Money Mindset)
 { v: "J1GBqATZBRA", t: "Size your solar system to your actual consumption. An oversized system inflates cost without a matching saving.", topic: "Money Mindset", tags: ["sizing", "solar"], off: 200 },
 { v: "J1GBqATZBRA", t: "The PM Surya Ghar subsidy is capped by system size. Claim it correctly, but don't let the subsidy alone push you to an over-large system.", topic: "Govt Schemes", tags: ["PM-SGY", "subsidy"], off: 600 },
 { v: "J1GBqATZBRA", t: "Vet the installer and the warranty. A cheap install that fails wrecks the payback math that justified going solar.", topic: "Money Mindset", tags: ["installer", "warranty"], off: 1200 },
 { v: "J1GBqATZBRA", t: "Net-metering rules decide how much you earn for surplus power, so confirm your state's policy before you invest.", topic: "Govt Schemes", tags: ["net metering"], off: 1900 },

  // FRAUD Data Entry Jobs, qGuhSPTEERQ (Money Mindset + Govt Schemes)
 { v: "qGuhSPTEERQ", t: "Any 'job' that asks you to pay a registration or training fee first is almost always a scam. Real employers pay you, not the reverse.", q: "Job ke liye paisa maang rahe hain to scam hai.", topic: "Money Mindset", tags: ["job scam"], off: 120 },
 { v: "qGuhSPTEERQ", t: "Work-from-home 'data entry' offers promising high pay for trivial work are bait, so verify the company before sharing anything.", topic: "Money Mindset", tags: ["work from home"], off: 300 },
 { v: "qGuhSPTEERQ", t: "Never share Aadhaar, PAN or signed blank papers with an unverified employer, since they can be misused to open accounts in your name.", topic: "Money Mindset", tags: ["identity theft"], off: 480 },
 { v: "qGuhSPTEERQ", t: "If you've been cheated, file on the National Cyber Crime portal and your consumer forum, and document everything you have.", topic: "Govt Schemes", tags: ["cybercrime", "complaint"], off: 640 },
];

// ── Build insights.json ─────────────────────────────────────────────────────
const perVideoIndex = {};
const insights = SRC.map((s) => {
 const v = VIDEO_META[s.v];
 if (!v) throw new Error(`Insight references unknown video: ${s.v}`);
 const i = (perVideoIndex[s.v] = (perVideoIndex[s.v] ?? -1) + 1);
 const rec = {
 id: `${s.v}-${i}`,
 videoId: s.v,
 takeaway: s.t,
 topic: s.topic,
 tags: s.tags || [],
 offsetSec: s.off,
    deepLink: `https://youtu.be/${s.v}?t=${s.off}`,
 videoTitle: v.title,
 thumb: thumb(s.v),
 videoViews: v.views,
 publishedAt: v.publishedAt,
 };
 if (s.q) rec.quote = s.q;
 return rec;
});

// ── Build videos.json ───────────────────────────────────────────────────────
const videos = Object.entries(VIDEO_META)
 .map(([id, v]) => ({
 id,
 title: v.title,
 publishedAt: v.publishedAt,
 views: v.views,
 likes: v.likes,
 comments: v.comments,
 durationSec: v.durationSec,
 isShort: !!v.isShort,
 topic: v.topic,
 thumb: thumb(id),
 insightCount: perVideoIndex[id] != null ? perVideoIndex[id] + 1 : 0,
 }))
 .sort((a, b) => b.views - a.views);

// ── Build stats.json (mirrors the analytics summary shape) ──────────────────
// Catalog-wide runtime is an ESTIMATE: long-form avg ~16min, shorts ~42s.
const totalRuntimeSec =
 SUMMARY.totals.longform * 16 * 60 + SUMMARY.totals.shorts * 42;

const stats = {
 _meta: {
 description:
 "Aggregates for LLA Insights. Catalog totals + by-year + topic distributions + top lists are REAL (YouTube Data API v3 pull 2026-05-30). total_runtime_sec and total_insights are derived. Re-pull at build time via the live pipeline for freshness.",
 captured: SUMMARY.channel.captured,
 isSeed: true,
 },
 channel: SUMMARY.channel,
 totals: {
 ...SUMMARY.totals,
 total_insights: insights.length,
 total_runtime_sec: totalRuntimeSec,
 total_runtime_estimated: true,
 },
 topics: SUMMARY.topics_longform.map((t) => ({
 topic: aliasTopic(t.topic),
 count: t.count,
 views: t.views,
 })),
 byYear: SUMMARY.by_year.map((y) => ({
 year: y.year,
 count: y.count,
 views: y.views,
 likes: y.likes,
 })),
 topLongform: SUMMARY.top_longform_by_views.map((v) => ({
 id: v.id,
 title: v.title,
 views: v.views,
 likes: v.likes,
 comments: v.comments,
 topic: aliasTopic(v.topic),
 publishedAt: v.publishedAt,
 })),
 topByLikes: SUMMARY.top_longform_by_likes.slice(0, 6),
 topByComments: SUMMARY.top_longform_by_comments.slice(0, 6),
 topShorts: SUMMARY.top_shorts_by_views.slice(0, 10),
};

// ── Write ───────────────────────────────────────────────────────────────────
const write = (rel, data, pretty = true) =>
 fs.writeFileSync(path.join(ROOT, rel), JSON.stringify(data, null, pretty ? 2 : 0));

write("data/videos.json", videos);
write("data/insights.json", insights);
write("data/stats.json", stats);

const byTopic = insights.reduce((m, i) => ((m[i.topic] = (m[i.topic] || 0) + 1), m), {});
console.log(`seed complete:`);
console.log(` videos.json ${videos.length} videos`);
console.log(` insights.json ${insights.length} insights`);
console.log(` stats.json totals + ${stats.topics.length} topics + ${stats.byYear.length} years`);
console.log(` insights by topic:`, byTopic);
