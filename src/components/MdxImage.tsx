"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon } from "lucide-react";
import { useLang } from "./LangProvider";
import { cn } from "@/lib/utils";
import { Lightbox, type LightboxImage } from "./Lightbox";

export type ImageAlign = "left" | "center" | "right";

const alignClass: Record<ImageAlign, string> = {
  left: "mr-auto",
  center: "mx-auto",
  right: "ml-auto",
};

/**
 * 正文图片：
 * - width/height 由构建期探测的尺寸清单注入，先占好位再加载，不产生 CLS
 * - 加载中显示骨架、失败显示兜底（保留 alt）
 * - 点击进入全屏预览，同一篇文章内的图片成组，可左右切换
 */
export function MdxImage({
  src,
  alt = "",
  width,
  height,
  displayWidth,
  align = "center",
}: {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  displayWidth?: number;
  align?: ImageAlign;
}) {
  const { t } = useLang();
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [group, setGroup] = useState<{
    images: LightboxImage[];
    index: number;
  } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // 命中缓存时 onLoad 可能早于 hydration，补一次检查避免图片停在 opacity-0
  useEffect(() => {
    const el = imgRef.current;
    if (el?.complete) setLoaded(true);
  }, []);

  const ratio = width && height ? `${width} / ${height}` : undefined;

  const open = () => {
    const el = imgRef.current;
    if (!el) return;
    const scope = el.closest("article") ?? el.closest(".prose") ?? document;
    const list = Array.from(
      scope.querySelectorAll<HTMLImageElement>("img[data-mdx-image]"),
    );
    const index = list.indexOf(el);
    setGroup({
      images: list.map((n) => ({ src: n.currentSrc || n.src, alt: n.alt })),
      index: Math.max(0, index),
    });
  };

  if (failed) {
    return (
      <span
        role="img"
        aria-label={alt || t("ui.imageFailed")}
        className={cn("mdx-img-fallback my-6", alignClass[align])}
        style={{ maxWidth: displayWidth, aspectRatio: ratio }}
      >
        <ImageIcon className="h-6 w-6 shrink-0" strokeWidth={1.5} />
        <span>{alt || t("ui.imageFailed")}</span>
      </span>
    );
  }

  return (
    <span
      className={cn("mdx-img my-6", alignClass[align])}
      style={{ maxWidth: displayWidth, aspectRatio: ratio }}
    >
      {!loaded && ratio && (
        <span className="mdx-img-skeleton animate-pulse" aria-hidden />
      )}
      <button
        type="button"
        onClick={open}
        aria-label={t("ui.enlargeImage") + (alt ? ": " + alt : "")}
        className="block w-full cursor-zoom-in"
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          data-mdx-image
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "h-auto w-full rounded-card border border-border transition-transform duration-200",
            "[@media(hover:hover)]:hover:scale-[1.02]",
            // 只在骨架同样渲染时隐藏图片，避免无尺寸图片永远不显示
            !loaded && ratio && "opacity-0",
          )}
        />
      </button>
      {group && (
        <Lightbox
          images={group.images}
          index={group.index}
          onClose={() => setGroup(null)}
          onIndex={(i) => setGroup((g) => (g ? { ...g, index: i } : g))}
        />
      )}
    </span>
  );
}

/** 多图并排：窄屏自动降级为单列 */
export function ImageRow({
  children,
  cols = 2,
}: {
  children: React.ReactNode;
  cols?: 2 | 3;
}) {
  return (
    <div
      className={cn(
        "my-6 grid gap-3",
        cols === 3
          ? "grid-cols-1 tablet:grid-cols-3"
          : "grid-cols-1 tablet:grid-cols-2",
      )}
    >
      {children}
    </div>
  );
}
