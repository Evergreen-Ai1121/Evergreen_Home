"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon, Loader2, X } from "lucide-react";
import { useLang } from "./LangProvider";
import { trapTab } from "@/lib/focus";

export interface LightboxImage {
  src: string;
  alt: string;
}

/**
 * 全屏图片预览：左右切换、Esc 关闭、移动端左右滑动切换。
 * 说说图片墙与正文图片共用同一套交互。
 */
export function Lightbox({
  images,
  index,
  onClose,
  onIndex,
}: {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const { t } = useLang();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const startX = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const total = images.length;

  const prev = useCallback(
    () => onIndex((index - 1 + total) % total),
    [index, total, onIndex],
  );
  const next = useCallback(
    () => onIndex((index + 1) % total),
    [index, total, onIndex],
  );

  const handlers = useRef({ prev, next, onClose });
  handlers.current = { prev, next, onClose };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handlers.current.onClose();
      if (e.key === "ArrowLeft") handlers.current.prev();
      if (e.key === "ArrowRight") handlers.current.next();
      if (e.key === "Tab") trapTab(e, dialogRef.current);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 换图后重新进入加载态：否则上一张的 spinner 结果会带过来
  useEffect(() => {
    setLoading(true);
    setFailed(false);
  }, [index]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const restoreFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      restoreFocus?.focus?.();
    };
  }, []);

  const current = images[index];
  if (!current) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t("ui.preview")}
      className="fixed inset-0 z-[60] flex items-center justify-center"
      onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (startX.current === null) return;
        const dx = e.changedTouches[0].clientX - startX.current;
        if (Math.abs(dx) > 60) (dx > 0 ? prev : next)();
        startX.current = null;
      }}
    >
      <div
        className="absolute inset-0 bg-scrim backdrop-blur"
        onClick={onClose}
        aria-hidden
      />
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={t("ui.closePreview")}
        className="absolute right-4 top-4 z-10 min-h-11 min-w-11 inline-flex items-center justify-center rounded-control bg-surface p-2 text-text-muted hover:text-text"
      >
        <X className="h-5 w-5" strokeWidth={1.5} />
      </button>
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label={t("ui.prevImage")}
            className="absolute left-2 z-10 min-h-11 min-w-11 inline-flex items-center justify-center rounded-control bg-surface p-2 text-text-muted hover:text-text tablet:left-6"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={t("ui.nextImage")}
            className="absolute right-2 z-10 min-h-11 min-w-11 inline-flex items-center justify-center rounded-control bg-surface p-2 text-text-muted hover:text-text tablet:right-6"
          >
            <ChevronRight className="h-6 w-6" strokeWidth={1.5} />
          </button>
          <p className="absolute left-1/2 top-5 z-10 -translate-x-1/2 text-xs text-text-muted">
            {index + 1} / {total}
          </p>
        </>
      )}
      <figure className="relative z-[5] max-h-[85dvh] w-full px-4">
        {loading && (
          <Loader2
            className="mx-auto h-6 w-6 animate-spin text-text-muted"
            strokeWidth={1.5}
          />
        )}
        {failed ? (
          <div className="mx-auto flex max-w-xs flex-col items-center gap-2 rounded-card border border-border bg-surface px-6 py-12 text-sm text-text-muted">
            <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
            <span>{current.alt || t("ui.imageFailed")}</span>
          </div>
        ) : (
          <img
            src={current.src}
            alt={current.alt}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setFailed(true);
            }}
            className="mx-auto max-h-[85dvh] w-auto rounded-card object-contain"
          />
        )}
        {current.alt && (
          <figcaption className="mt-3 text-center text-sm text-text-muted">
            {current.alt}
          </figcaption>
        )}
      </figure>
    </div>
  );
}
