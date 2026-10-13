import { getCollection, type CollectionType, type DocMeta } from "@/lib/content";
import { site } from "@/lib/site";

const TYPES: CollectionType[] = ["posts", "notes", "projects"];

const PATH_OF: Record<CollectionType, string> = {
  posts: "/posts",
  notes: "/notes",
  projects: "/projects",
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function itemOf(base: string, doc: DocMeta): string {
  const url = `${base}${PATH_OF[doc.type]}/${encodeURIComponent(doc.slug)}`;
  return `    <item>
      <title>${escapeXml(doc.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(doc.date).toUTCString()}</pubDate>
      <description>${escapeXml(doc.summary || doc.title)}</description>
${doc.tags.map((t) => `      <category>${escapeXml(t)}</category>`).join("\n")}
    </item>`;
}

export function GET() {
  const base = site.url.replace(/\/$/, "");
  const items = TYPES.flatMap((t) => getCollection(t))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, 50);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${base}</link>
    <description>${escapeXml(site.description)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />
${items.map((d) => itemOf(base, d)).join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
