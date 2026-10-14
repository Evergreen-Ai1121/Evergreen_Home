// 用 scripts/build-font-charset.mjs 生成的字符表，把得意黑子集化（只保留标题/站名会用到
// 的字形），输出 woff2，覆盖 public/fonts/SmileySans-Oblique.woff2。
// 用法：node scripts/subset-display-font.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import subsetFont from "subset-font";

const OUT = join(process.cwd(), "public/fonts/SmileySans-Oblique.woff2");
const charset = readFileSync(join(process.cwd(), "public/fonts/charset.txt"), "utf8");
const buf = readFileSync(OUT);

const subset = await subsetFont(buf, charset, { formats: ["woff2"] });
writeFileSync(OUT, subset);
console.log(`subset done -> ${OUT} (${subset.length} bytes)`);
