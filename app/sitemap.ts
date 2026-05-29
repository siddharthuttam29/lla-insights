import type { MetadataRoute } from "next";
import { insights, videosWithInsights } from "@/lib/data";
import { TOPICS, topicToSlug } from "@/lib/types";
import { SITE_URL } from "@/lib/site";

// Covers every insight/video/topic route, unlocks Google traffic (people search
// "LLA term insurance advice"). BUILD-SPEC §8.
export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${SITE_URL}${p}`;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: u("/"), priority: 1, changeFrequency: "weekly", lastModified: now },
    { url: u("/numbers"), priority: 0.7, changeFrequency: "monthly", lastModified: now },
    { url: u("/about"), priority: 0.4, changeFrequency: "yearly", lastModified: now },
  ];

  const topicRoutes: MetadataRoute.Sitemap = TOPICS.map((t) => ({
    url: u(`/topic/${topicToSlug(t)}`),
    priority: 0.7,
    changeFrequency: "weekly",
    lastModified: now,
  }));

  const videoRoutes: MetadataRoute.Sitemap = videosWithInsights().map((v) => ({
    url: u(`/video/${v.id}`),
    priority: 0.6,
    changeFrequency: "monthly",
    lastModified: now,
  }));

  const insightRoutes: MetadataRoute.Sitemap = insights.map((i) => ({
    url: u(`/insight/${i.id}`),
    priority: 0.5,
    changeFrequency: "monthly",
    lastModified: now,
  }));

  return [...staticRoutes, ...topicRoutes, ...videoRoutes, ...insightRoutes];
}
