"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 图片加载失败时保留占位与 alt，不破坏布局。
 */
export function SafeImage({
  src,
  alt,
  className,
  ratio = "16 / 9",
  loading = "lazy",
  ...rest
}: React.ImgHTMLAttributes<HTMLImageElement> & { ratio?: string }) {
  const [failed, setFailed] = useState(false);
  const decoding = loading === "eager" ? "sync" : "async";

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        style={{ aspectRatio: ratio }}
        className={cn(
          "flex items-center justify-center rounded-card border border-border bg-surface p-4 text-center text-xs text-text-muted",
          className,
        )}
      >
        <span className="flex flex-col items-center gap-2">
          <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
          {alt || "图片"}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      onError={() => setFailed(true)}
      style={{ aspectRatio: ratio }}
      className={cn("h-full w-full object-cover", className)}
      {...rest}
    />
  );
}
