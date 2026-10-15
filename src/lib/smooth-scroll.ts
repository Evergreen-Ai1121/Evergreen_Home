import type Lenis from "lenis";

/**
 * 当前生效的 Lenis 实例。只在首页桌面端存在，其余页面为 null，
 * 需要滚动的地方（回到顶部）据此决定走 Lenis 还是原生。
 */
let instance: Lenis | null = null;

export function setLenis(next: Lenis | null) {
  instance = next;
}

export function getLenis() {
  return instance;
}
