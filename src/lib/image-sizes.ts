import fs from "node:fs";
import path from "node:path";

export interface ImageSize {
  width: number;
  height: number;
}

let cache: Record<string, ImageSize> | null = null;

/** 构建期生成的图片尺寸清单（scripts/sync-content-images.mjs 产出） */
export function loadImageSizes(): Record<string, ImageSize> {
  if (cache) return cache;
  try {
    cache = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "public", "image-sizes.json"), "utf8"),
    ) as Record<string, ImageSize>;
  } catch {
    cache = {};
  }
  return cache;
}

/** 按图片 URL 查宽高；带 ?w= 等查询参数时自动去掉 */
export function sizeOf(src?: string | null): ImageSize | undefined {
  if (!src) return undefined;
  const q = src.indexOf("?");
  return loadImageSizes()[q === -1 ? src : src.slice(0, q)];
}
