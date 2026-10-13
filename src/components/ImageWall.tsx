"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SafeImage } from "./SafeImage";

export interface WallImage {
  src: string;
  thumb?: string;
  alt: string;
  width?: number;
  height?: number;
}

function Lightbox({
  images,
  index,
  onClose,
  onIndex,
}: {
  images: WallImage[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const [loading, setLoading] = useState(true);
  const startX = useRef<number | null>(null);

  const prev = useCallback(() => onIndex((index - 1 + images.length) % images.length), [index, images.length, onIndex]);
  const next = useCallback(() => onIndex((index + 1) % images.length), [index, images.length, onIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, prev, next]);

  const current = images[index];
  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
      className="fixed inset-0 z-50 flex items-center justify-center"
      onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (startX.current === null) return;
        const dx = e.changedTouches[0].clientX - startX.current;
        if (Math.abs(dx) > 60) (dx > 0 ? prev : next)();
        startX.current = null;
      }}
    >
      <div className="absolute inset-0 bg-scrim backdrop-blur" onClick={onClose} aria-hidden />
      <button
        type="button"
        onClick={onClose}
        aria-label="关闭预览"
        className="absolute right-4 top-4 z-10 rounded-control bg-surface p-2 text-text-muted hover:text-text"
      >
        <X className="h-5 w-5" strokeWidth={1.5} />
      </button>
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="上一张"
            className="absolute left-2 z-10 rounded-control bg-surface p-2 text-text-muted hover:text-text tablet:left-6"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="下一张"
            className="absolute right-2 z-10 rounded-control bg-surface p-2 text-text-muted hover:text-text tablet:right-6"
          >
            <ChevronRight className="h-6 w-6" strokeWidth={1.5} />
          </button>
        </>
      )}
      <figure className="relative z-[5] max-h-[85dvh] w-full px-4">
        {loading && (
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-text-muted" strokeWidth={1.5} />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.src}
          alt={current.alt}
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
          className="mx-auto max-h-[85dvh] w-auto rounded-card object-contain"
        />
        {current.alt && (
          <figcaption className="mt-3 text-center text-sm text-text-muted">
            {current.alt}
          </figcaption>
        )}
      </figure>
    </div>
  );
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
