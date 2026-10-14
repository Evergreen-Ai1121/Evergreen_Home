// 生成得意黑（展示字体）的子集字符表。展示字体只用在 h1/h2 与站名上，所以只需覆盖：
//   1. content/ 里 markdown 的 # / ## 标题
//   2. content/ 里 frontmatter 的 title 与 tags（详情页 h1、标签页 h1 会渲染它们）
//   3. src/lib/i18n.ts 的字典值（页面大标题、目录小标题等走 <T> 的字都来自这里）
//   4. src/app/page.tsx 首页 hero 的 h1 文案
//   5. 全部 ASCII 可见字符 + 常用中文标点
// 大幅压低字体体积，避免移动端 LCP 被全量字形拖慢。
// 用法：node scripts/build-font-charset.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const CONTENT = join(ROOT, "content");
const SRC = join(ROOT, "src");

const seen = new Set();
const CJK = /[\u00b7\u3000-\u9fff\uf900-\ufaff\uff00-\uffef]/g;

function add(text) {
  if (!text) return;
  for (const ch of text.match(CJK) ?? []) seen.add(ch);
}

/** 去掉注释后扫描（块注释、JSX 注释、行注释全清掉，免得把注释里的中文也算进子集） */
function scanFile(p) {
  const code = readFileSync(p, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  add(code);
}

/* 1+2. content：markdown 标题 + frontmatter 的 title / tags */
function walkContent(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkContent(p);
    else if (/\.mdx?$/.test(name)) {
      const text = readFileSync(p, "utf8");
      const fm = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? "";
      for (const line of fm.split("\n")) {
        const title = /^title:\s*["']?(.+?)["']?\s*$/.exec(line);
        if (title) add(title[1]);
        const tags = /^tags:\s*\[(.*)\]/.exec(line);
        if (tags) add(tags[1]);
      }
      for (const line of text.split("\n")) {
        const m = /^(#{1,2})\s+(.*)$/.exec(line);
        if (m) add(m[2]);
      }
    }
  }
}

/* 3+4. 展示字体实际出现的字：i18n 字典值 + 首页 hero h1（其它正文/描述本来就不是展示字体） */
scanFile(join(SRC, "lib/i18n.ts"));
scanFile(join(SRC, "app/page.tsx"));

/* 5. 仍用 h1/h2/.font-display 渲染、且写死中文的组件（字典与首页已覆盖的就不重复扫） */
scanFile(join(SRC, "app/not-found.tsx")); // 404 大标题「页面走丢了」
scanFile(join(SRC, "components/License.tsx")); // 详情页 h2「版权声明」
scanFile(join(SRC, "app/projects/[slug]/page.tsx")); // 详情页 h2「技术栈」
scanFile(join(SRC, "components/AdminClient.tsx")); // 管理端 h2「最新评论 / 最近 20 条」

/* 5. ASCII 可见字符 */
for (let c = 0x20; c <= 0x7e; c++) seen.add(String.fromCharCode(c));

/* 常用中文标点 / 符号 */
add("，。、；：？！“”‘’（）《》【】—…·～％＃＠＆＊＋＝－／＼＜＞｜");

walkContent(CONTENT);

const chars = [...seen].sort().join("");
writeFileSync(join(ROOT, "public/fonts/charset.txt"), chars, "utf8");
console.log(`charset: ${chars.length} 个字符 -> public/fonts/charset.txt`);
