// 用 scripts/build-font-charset.mjs 生成的字符表，把得意黑子集化（只保留标题/站名会用到
// 的字形），输出 woff2，覆盖 public/fonts/SmileySans-Oblique.woff2。
// 用法：node scripts/subset-display-font.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import subsetFont from "subset-font";

// 全量字体源（已入库，保证随时可重跑子集）
const SRC_FONT = join(process.cwd(), "assets/fonts/SmileySans-Oblique.otf");
const OUT = join(process.cwd(), "public/fonts/SmileySans-Oblique.woff2");
const charset = readFileSync(join(process.cwd(), "public/fonts/charset.txt"), "utf8");
const buf = readFileSync(SRC_FONT);

const subset = await subsetFont(buf, charset, { formats: ["woff2"] });
writeFileSync(OUT, subset);
console.log(`subset done -> ${OUT} (${subset.length} bytes)`);
