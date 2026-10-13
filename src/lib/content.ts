import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";

export type CollectionType = "notes" | "posts" | "projects";

export interface DocLink {
  label: string;
  href: string;
}

export interface DocMeta {
  slug: string;
  type: CollectionType;
  title: string;
  summary: string;
  date: string;
  updated?: string;
  tags: string[];
  category?: string;
  cover?: string;
  draft: boolean;
  readingTime: number;
  featured: boolean;
  stack: string[];
  links: DocLink[];
}

export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}

export interface Doc extends DocMeta {
  content: string;
  toc: TocItem[];
}

const CONTENT_DIR = path.join(process.cwd(), "content");

function readDir(type: CollectionType): string[] {
  const dir = path.join(CONTENT_DIR, type);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
}

/** 中英混排阅读时长：中文 350 字/分钟，英文 220 词/分钟 */
export function readingTimeOf(body: string): number {
  const plain = body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\$\$[\s\S]*?\$\$/g, "")
    .replace(/[#>*`_\-[\]()!]/g, "");
  const cjk = (plain.match(/[\u4e00-\u9fa5\u3040-\u30ff]/g) || []).length;
  const words = (plain.match(/[A-Za-z0-9']+/g) || []).length;
  return Math.max(1, Math.round(cjk / 350 + words / 220));
}

export function buildToc(body: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  const re = /^(#{2,3})\s+(.+?)\s*$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    const depth = m[1].length === 2 ? 2 : 3;
    const text = m[2].replace(/[*_`]/g, "").trim();
    items.push({ id: slugger.slug(text), text, depth });
  }
  return items;
}

function toMeta(type: CollectionType, filename: string, raw: string): DocMeta {
  const { data, content } = matter(raw);
  const slug = filename.replace(/\.mdx?$/, "");
  const date = data.date instanceof Date ? data.date.toISOString() : String(data.date ?? "");
  return {
    slug,
    type,
    title: String(data.title ?? slug),
    summary: String(data.summary ?? data.description ?? ""),
    date: date.slice(0, 10),
    updated: data.updated ? String(data.updated).slice(0, 10) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    category: data.category ? String(data.category) : undefined,
    cover: data.cover ? String(data.cover) : undefined,
    draft: Boolean(data.draft),
    readingTime: readingTimeOf(content),
    featured: Boolean(data.featured),
    stack: Array.isArray(data.stack) ? data.stack.map(String) : [],
    links: Array.isArray(data.links)
      ? data.links.map((l: DocLink) => ({ label: String(l.label), href: String(l.href) }))
      : [],
  };
}

/** 读取某个集合的全部文档，按日期倒序（draft 在生产构建中被剔除） */
export function getCollection(type: CollectionType): DocMeta[] {
  const includeDrafts = process.env.NODE_ENV !== "production";
  return readDir(type)
    .map((f) => toMeta(type, f, fs.readFileSync(path.join(CONTENT_DIR, type, f), "utf8")))
    .filter((d) => includeDrafts || !d.draft)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getAllSlugs(type: CollectionType): string[] {
  return getCollection(type).map((d) => d.slug);
}

export function getDoc(type: CollectionType, slug: string): Doc | null {
  const file = [`${slug}.mdx`, `${slug}.md`]
    .map((f) => path.join(CONTENT_DIR, type, f))
    .find((p) => fs.existsSync(p));
  if (!file) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { content } = matter(raw);
  return {
    ...toMeta(type, path.basename(file), raw),
    content,
    toc: buildToc(content),
  };
}

export function getCategories(type: CollectionType): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const d of getCollection(type)) {
    if (!d.category) continue;
    map.set(d.category, (map.get(d.category) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getTags(type: CollectionType): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const d of getCollection(type)) {
    for (const t of d.tags) map.set(t, (map.get(t) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/** 按年份归档 */
export function getArchive(type: CollectionType): { year: string; items: DocMeta[] }[] {
  const map = new Map<string, DocMeta[]>();
  for (const d of getCollection(type)) {
    const year = d.date.slice(0, 4) || "未标日期";
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(d);
  }
  return [...map.entries()]
    .map(([year, items]) => ({ year, items }))
    .sort((a, b) => (a.year < b.year ? 1 : -1));
}

/** 读取独立页面 MDX（content/pages/about.mdx 等） */
export function getPage(slug: string): { content: string; title: string } | null {
  const file = path.join(CONTENT_DIR, "pages", `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return { content, title: String(data.title ?? slug) };
}

export function formatDate(date: string): string {
  if (!date) return "";
  const [y, m, d] = date.split("-");
  return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`;
}
