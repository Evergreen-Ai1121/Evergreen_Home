import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { fileURLToPath } from "node:url";
import { loadTs } from "./load-ts.mjs";
const { normalizeDate } = await loadTs(
  fileURLToPath(new URL("../src/lib/content-rules.ts", import.meta.url)),
);

const CONTENT = path.join(process.cwd(), "content");
const OUT = path.join(process.cwd(), "public", "search-index.json");

const COLLECTIONS = [
  { dir: "notes", type: "notes", base: "/notes/" },
  { dir: "posts", type: "posts", base: "/posts/" },
  { dir: "projects", type: "projects", base: "/projects/" },
];

function stripMarkdown(body) {
  return body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\$\$[\s\S]*?\$\$/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*`_|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** 正文也进索引（搜得到正文里的词）。截断到 3000 字，控制索引体积 */
const BODY_LIMIT = 3000;

const items = [];

for (const c of COLLECTIONS) {
  const dir = path.join(CONTENT, c.dir);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter((f) => /\.mdx?$/.test(f))) {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    if (data.draft) continue;
    const slug = file.replace(/\.mdx?$/, "");
    const summary = String(data.summary ?? data.description ?? "").slice(
      0,
      120,
    );
    const plain = stripMarkdown(content);
    items.push({
      type: c.type,
      title: String(data.title ?? slug),
      summary: summary || plain.slice(0, 120),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      url: `${c.base}${encodeURIComponent(slug)}`,
      date: normalizeDate(data.date),
      body: plain.slice(0, BODY_LIMIT),
    });
  }
}

items.sort(
  (a, b) => b.date.localeCompare(a.date) || a.url.localeCompare(b.url),
);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(items));
console.log(`search-index.json 已生成：${items.length} 条`);
