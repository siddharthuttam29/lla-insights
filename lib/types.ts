// Data contracts the web app renders. Mirrors BUILD-SPEC §5.6.

export const TOPICS = [
  "Tax",
  "Investing",
  "Insurance",
  "Salary & PF",
  "Credit & Loans",
  "Banking",
  "Business & Startup",
  "Real Estate",
  "Govt Schemes",
  "Money Mindset",
] as const;

export type Topic = (typeof TOPICS)[number];

export type Insight = {
  id: string; // `${videoId}-${i}`
  videoId: string;
  takeaway: string; // the headline lesson (always present)
  quote?: string; // optional original-language pull-quote
  topic: Topic;
  tags: string[];
  offsetSec: number; // moment in the video
  deepLink: string; // https://youtu.be/<id>?t=<offsetSec>
  // denormalized for fast rendering:
  videoTitle: string;
  thumb: string;
  videoViews: number;
  publishedAt: string; // ISO
};

export type Video = {
  id: string;
  title: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  durationSec: number;
  isShort: boolean;
  topic: Topic;
  thumb: string;
  insightCount: number;
};

export type TopicStat = { topic: string; count: number; views: number };
export type YearStat = { year: string; count: number; views: number; likes?: number };
export type TopVideo = {
  id: string;
  title: string;
  views: number;
  likes?: number;
  comments?: number;
  topic?: string;
  publishedAt?: string;
};

export type Stats = {
  _meta?: { description?: string; captured?: string; isSeed?: boolean };
  channel: {
    name: string;
    handle: string;
    channelId: string;
    subscribers_approx: string;
    tagline: string;
    hosts: string[];
    founded: string;
    captured: string;
  };
  totals: {
    videos: number;
    longform: number;
    shorts: number;
    total_views: number;
    total_likes: number;
    total_comments: number;
    first_year: string;
    last_year: string;
    avg_views_longform: number;
    total_insights: number;
    total_runtime_sec: number;
    total_runtime_estimated?: boolean;
  };
  topics: TopicStat[];
  byYear: YearStat[];
  topLongform: TopVideo[];
  topByLikes: TopVideo[];
  topByComments: TopVideo[];
  topShorts: TopVideo[];
};

// Topic → URL slug and back.
export const topicToSlug = (t: string): string =>
  t
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const slugToTopic = (slug: string): Topic | undefined =>
  TOPICS.find((t) => topicToSlug(t) === slug);
