import { cn } from "@/lib/utils";

/**
 * 签名元素：大面幅柔和背景光晕，缓慢漂移。
 * 纯装饰，aria-hidden，且在 reduced-motion 下自动静止（见 globals.css）。
 */
export function GlowBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)}
    >
      <div className="absolute -left-[10%] -top-[15%] h-[46rem] w-[46rem] rounded-full bg-glow-a blur-[110px] animate-glow-a" />
      <div className="absolute right-[-12%] top-[8%] h-[38rem] w-[38rem] rounded-full bg-glow-b blur-[120px] animate-glow-b" />
      <div className="absolute bottom-[-18%] left-[25%] h-[42rem] w-[42rem] rounded-full bg-glow-c blur-[130px] animate-glow-c" />
    </div>
  );
}
