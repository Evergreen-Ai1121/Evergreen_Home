// 生成得意黑（展示字体）的子集字符表：只保留 h1/h2 标题、站名/标语会出现的字形，
// 大幅压低字体体积，避免移动端 LCP 被 490KB 全量字形拖慢。
// 用法：node scripts/build-font-charset.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const CONTENT = join(ROOT, "content");
const SITE_TS = join(ROOT, "src/lib/site.ts");

const seen = new Set();

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.mdx?$/.test(name)) collectHeadings(p);
  }
}

function collectHeadings(file) {
  const text = readFileSync(file, "utf8");
  for (const line of text.split("\n")) {
    const m = /^(#{1,2})\s+(.*)$/.exec(line);
    if (!m) continue;
    for (const ch of m[2]) if (/\S/.test(ch)) seen.add(ch);
  }
}

// 站名 / 标语（Nav 里字体用 font-display）
const siteText = readFileSync(SITE_TS, "utf8");
const name = /name:\s*"([^"]+)"/.exec(siteText)?.[1] ?? "";
const tagline = /tagline:\s*"([^"]+)"/.exec(siteText)?.[1] ?? "";
for (const ch of name + tagline) if (/\S/.test(ch)) seen.add(ch);

// 全部 ASCII 可见字符 + 数字
for (let c = 0x20; c <= 0x7e; c++) seen.add(String.fromCharCode(c));

// 常用中文标点 / 符号
for (const ch of "，。、；：？！“”‘’（）《》【】—…·～·％＃＠＆＊＋＝－／＼＜＞｜".split(""))
  seen.add(ch);

walk(CONTENT);

const chars = [...seen].sort().join("");
writeFileSync(join(ROOT, "public/fonts/charset.txt"), chars, "utf8");
console.log(`charset: ${chars.length} 个字符 -> public/fonts/charset.txt`);
