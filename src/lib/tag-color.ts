/**
 * 标签配色：按标签名固定分配一个颜色，同一个标签全站同色。
 * 浅色用 -700 文字 + 12% 底，深色用 -300 文字，均已按 AA 校准。
 */
const PALETTE = [
  "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  "bg-amber-500/12 text-amber-800 dark:text-amber-300",
  "bg-rose-500/12 text-rose-700 dark:text-rose-300",
  "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300",
] as const;

export function tagColor(name: string): string {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum = (sum + name.charCodeAt(i)) % 997;
  return PALETTE[sum % PALETTE.length];
}
