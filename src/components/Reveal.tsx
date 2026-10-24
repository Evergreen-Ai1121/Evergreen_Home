import type { ReactNode } from "react";
/** Visible in SSR; the global observer progressively enhances below-fold content. */
export function Reveal({
  children,
  className,
  index = 0,
}: {
  children: ReactNode;
  className?: string;
  index?: number;
  variant?: "fade" | "rise";
}) {
  return (
    <div
      className={className}
      data-reveal
      data-reveal-index={Math.min(index, 3)}
    >
      {children}
    </div>
  );
}
