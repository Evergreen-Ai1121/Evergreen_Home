import type { MetadataRoute } from "next";
import { getAllSlugs, getAllTags } from "@/lib/content";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/notes`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/posts`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/moments`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/projects`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/tags`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/archive`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    ...getAllTags().map((t) => ({
      url: `${base}/tags/${encodeURIComponent(t.name)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
    ...getAllSlugs("notes").map((slug) => ({
      url: `${base}/notes/${encodeURIComponent(slug)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...getAllSlugs("posts").map((slug) => ({
      url: `${base}/posts/${encodeURIComponent(slug)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...getAllSlugs("projects").map((slug) => ({
      url: `${base}/projects/${encodeURIComponent(slug)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
