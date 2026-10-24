import type { MetadataRoute } from "next";
import { getAllDocs, getAllTags } from "@/lib/content";
import { site } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  return [
    ...["/", "/projects", "/blog", "/about", "/tags", "/archive"].map(
      (path) => ({
        url: base + path,
        changeFrequency: "weekly" as const,
        priority: path === "/" ? 1 : 0.8,
      }),
    ),
    ...getAllDocs().map((doc) => ({
      url: base + "/" + doc.type + "/" + encodeURIComponent(doc.slug),
      lastModified: doc.updated || doc.date || undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...getAllTags().map((tag) => ({
      url: base + "/tags/" + encodeURIComponent(tag.name),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
