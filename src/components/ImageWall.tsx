"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SafeImage } from "./SafeImage";
import { Lightbox } from "./Lightbox";

export interface WallImage {
  src: string;
  thumb?: string;
  alt: string;
  width?: number;
  height?: number;
}

/** 图片墙：1 张通栏 / 2 张两列 / 3-9 张三列，点击进入全屏预览 */
export function ImageWall({ images }: { images: WallImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  if (images.length === 0) return null;

  const cols = images.length === 1 ? 1 : images.length === 2 || images.length === 4 ? 2 : 3;

  return (
    <>
      <div
        className={cn(
          "mt-3 grid gap-2",
          cols === 1 && "grid-cols-1 max-w-[420px]",
          cols === 2 && "grid-cols-2 max-w-[520px]",
          cols === 3 && "grid-cols-3 max-w-[640px]",
        )}
      >
        {images.map((img, i) => (
          <button
            key={img.src + i}
            type="button"
            onClick={() => setIndex(i)}
            className="group relative overflow-hidden rounded-control border border-border"
            aria-label={`预览图片：${img.alt || `第 ${i + 1} 张`}`}
          >
            <SafeImage
              src={img.thumb ?? img.src}
              alt={img.alt}
              ratio="1 / 1"
              className="transition-transform duration-200 [@media(hover:hover)]:group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>
      {index !== null && (
        <Lightbox
          images={images}
          index={index}
          onClose={() => setIndex(null)}
          onIndex={setIndex}
        />
      )}
    </>
  );
}
