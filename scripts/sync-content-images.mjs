import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";

/**
 * 1) 把 content/<type>/<slug>/ 下的图片复制到 public/content-images/<type>/<slug>/
 *    —— 让 MDX 里可以写相对路径 ./cover.png，图片就放在文章旁边
 * 2) 探测 public 下所有图片的宽高，产出 public/image-sizes.json
 *    —— 正文 <img> 靠这份清单补 width/height，消灭 CLS
 */

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content");
const PUBLIC = path.join(ROOT, "public");
const OUT_DIR = path.join(PUBLIC, "content-images");
const SIZES_OUT = path.join(PUBLIC, "image-sizes.json");

const TYPES = ["notes", "posts", "projects"];
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".bmp", ".svg"]);

const isImage = (f) => IMAGE_EXT.has(path.extname(f).toLowerCase());

// ── 1. 复制文章旁边的图片 ──────────────────────────────
fs.rmSync(OUT_DIR, { recursive: true, force: true });

let copied = 0;
for (const type of TYPES) {
  const dir = path.join(CONTENT, type);
  if (!fs.existsSync(dir)) continue;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const srcDir = path.join(dir, entry.name);
    const files = fs.readdirSync(srcDir).filter(isImage);
    if (files.length === 0) continue;
    const dstDir = path.join(OUT_DIR, type, entry.name);
    fs.mkdirSync(dstDir, { recursive: true });
    for (const f of files) {
      fs.copyFileSync(path.join(srcDir, f), path.join(dstDir, f));
      copied++;
    }
  }
}

// ── 2. 探测图片宽高 ────────────────────────────────────
const sizes = {};

function probe(dir, urlPrefix) {
  if (!fs.existsSync(dir)) return;
  const walk = (current, rel) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const abs = path.join(current, entry.name);
      const relPath = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(abs, relPath);
        continue;
      }
      if (!isImage(entry.name)) continue;
      try {
        const dim = imageSize(fs.readFileSync(abs));
        if (dim?.width && dim?.height) {
          sizes[`${urlPrefix}/${relPath}`] = { width: dim.width, height: dim.height };
        }
      } catch {
        // 探测失败就跳过，页面会退回无尺寸的兜底渲染
      }
    }
  };
  walk(dir, "");
}

probe(path.join(PUBLIC, "images"), "/images");
probe(OUT_DIR, "/content-images");

fs.writeFileSync(SIZES_OUT, JSON.stringify(sizes));
console.log(
  `content-images：复制 ${copied} 张；image-sizes.json：${Object.keys(sizes).length} 条`,
);
