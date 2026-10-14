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
  /** frontmatter 里的徽标，设为 Pin 时列表置顶 */
  badge?: string;
  stack: string[];
  links: DocLink[];
  wordCount: number;
}

export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}

export interface HeadingItem {
  level: number;
  id: string;
  text: string;
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

/** 字数：中文按字计、英文按词计，代码块与公式不计数 */
export function wordCountOf(body: string): number {
  const plain = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\\\([\s\S]*?\\\)/g, " ");
  const cjk = (plain.match(/[\u4e00-\u9fa5\u3040-\u30ff]/g) || []).length;
  const words = (plain.match(/[A-Za-z0-9][A-Za-z0-9'’-]*/g) || []).length;
  return cjk + words;
}

/** 去掉围栏代码块（``` / ~~~），避免把代码里的 `# 注释` 当成标题 */
function stripFencedCode(body: string): string {
  const out: string[] = [];
  let fence: string | null = null;
  for (const line of body.split("\n")) {
    const m = /^\s*(`{3,}|~{3,})/.exec(line);
    if (m) {
      const mark = m[1][0];
      if (fence === null) fence = mark;
      else if (fence === mark) fence = null;
      continue;
    }
    if (fence === null) out.push(line);
  }
  return out.join("\n");
}

/**
 * 全量标题（h1–h6）按文档顺序生成 id。
 * 这些 id 是正文锚点的唯一来源（rehype-toc-ids 按同样顺序写回 DOM），
 * 因此目录与正文锚点不可能错位。
 */
export function buildHeadings(body: string): HeadingItem[] {
  const slugger = new GithubSlugger();
  const items: HeadingItem[] = [];
  const re = /^(#{1,6})\s+(.+?)\s*$/gm;
  const src = stripFencedCode(body);
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const text = m[2].replace(/[*_`]/g, "").trim();
    items.push({ level: m[1].length, id: slugger.slug(text), text });
  }
  return items;
}

export function buildToc(body: string): TocItem[] {
  return buildHeadings(body)
    .filter((h) => h.level === 2 || h.level === 3)
    .map((h) => ({ id: h.id, text: h.text, depth: h.level as 2 | 3 }));
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
    badge: data.badge ? String(data.badge) : undefined,
    stack: Array.isArray(data.stack) ? data.stack.map(String) : [],
    wordCount: wordCountOf(content),
    links: Array.isArray(data.links)
      ? data.links.map((l: DocLink) => ({ label: String(l.label), href: String(l.href) }))
      : [],
  };
}

export const PIN_BADGE = "Pin";

/** 读取某个集合的全部文档：置顶（badge: Pin）优先，其余按日期倒序（draft 在生产构建中被剔除） */
export function getCollection(type: CollectionType): DocMeta[] {
  const includeDrafts = process.env.NODE_ENV !== "production";
  return readDir(type)
    .map((f) => toMeta(type, f, fs.readFileSync(path.join(CONTENT_DIR, type, f), "utf8")))
    .filter((d) => includeDrafts || !d.draft)
    .sort((a, b) => {
      const ap = a.badge === PIN_BADGE ? 1 : 0;
      const bp = b.badge === PIN_BADGE ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
    });
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

/* ── 跨集合：标签页 / 归档页 / 相关推荐用 ─────────────── */

const ALL_TYPES: CollectionType[] = ["notes", "posts", "projects"];

/** 三类内容合在一起按时间倒序（各集合内被置顶的项可能挤到前面，这是列表里的既有行为） */
export function getAllDocs(): DocMeta[] {
  return ALL_TYPES.flatMap((t) => getCollection(t)).sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  );
}

/** 全站标签：按文章数降序，同数量时按名字排，保证每次构建顺序稳定 */
export function getAllTags(): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const d of getAllDocs()) {
    for (const t of d.tags) map.set(t, (map.get(t) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name, "zh"));
}

export function getDocsByTag(tag: string): DocMeta[] {
  return getAllDocs().filter((d) => d.tags.some((t) => t.toLowerCase() === tag.toLowerCase()));
}

const sameDoc = (a: DocMeta, b: DocMeta) => a.type === b.type && a.slug === b.slug;

/** 相关推荐：共享标签越多越靠前，没得推时降级为最新的几篇 */
export function getRelated(doc: DocMeta, limit = 3): DocMeta[] {
  const pool = getAllDocs().filter((d) => !sameDoc(d, doc));
  const scored = pool
    .map((d) => ({
      doc: d,
      score: d.tags.filter((t) => doc.tags.includes(t)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => (b.score - a.score) || (a.doc.date < b.doc.date ? 1 : -1));
  return (scored.length > 0 ? scored.map((x) => x.doc) : pool).slice(0, limit);
}

/**
 * 上一篇 / 下一篇：取列表相邻项（列表顺序 = 看到的顺序）。
 * prev 是列表里更靠前的一条（更新），next 是更靠后的一条（更早），到头的那侧为 null。
 */
export function getSiblings(type: CollectionType, slug: string): {
  prev: DocMeta | null;
  next: DocMeta | null;
} {
  const list = getCollection(type);
  const i = list.findIndex((d) => d.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return { prev: list[i - 1] ?? null, next: list[i + 1] ?? null };
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
