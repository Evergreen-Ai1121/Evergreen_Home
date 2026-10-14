/** 浮层里能获得焦点的元素（Tab 循环用） */
const FOCUSABLE =
  'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

/**
 * 焦点陷阱：Tab 只在浮层内循环。
 * 各自组件的 Esc 关闭逻辑不变，这里只处理首尾环绕。
 */
export function trapTab(e: KeyboardEvent, dialog: HTMLElement | null) {
  if (!dialog) return;
  const nodes = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (n) => n.offsetParent !== null,
  );
  if (nodes.length === 0) return;

  const first = nodes[0]!;
  const last = nodes[nodes.length - 1]!;
  const active = document.activeElement;

  if (e.shiftKey && active === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}
