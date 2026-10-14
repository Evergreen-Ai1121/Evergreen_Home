import { Fragment } from "react";
import { isHttpUrl } from "@/lib/utils";

/**
 * 说说的轻量 Markdown：只支持加粗、行内代码、链接、换行。
 * 全部走 React 元素渲染（不拼 HTML 字符串），用户输入天然被转义。
 */

// 先切出行内片段，再逐段识别；链接的 URL 部分不含空格与右括号
const TOKEN_RE = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\[[^\]\n]*\]\([^)\s]+\))/g;
const LINK_RE = /^\[([^\]]*)\]\(([^)\s]+)\)$/;

function renderInline(line: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  for (const m of line.matchAll(TOKEN_RE)) {
    const at = m.index ?? 0;
    if (at > last) nodes.push(line.slice(last, at));
    const token = m[0];
    const key = `${keyBase}-${at}`;

    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={key} className="rounded bg-surface-strong px-1 py-0.5 font-mono text-[0.9em]">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      const link = LINK_RE.exec(token);
      const href = link ? link[2] : "";
      // 协议不合法时按纯文本输出，不生成链接
      nodes.push(
        link && isHttpUrl(href) ? (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="text-accent underline decoration-dotted underline-offset-2 hover:decoration-solid"
          >
            {link[1]}
          </a>
        ) : (
          token
        ),
      );
    }
    last = at + token.length;
  }
  if (last < line.length) nodes.push(line.slice(last));
  return nodes;
}

export function MomentContent({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {renderInline(line, String(i))}
        </Fragment>
      ))}
    </>
  );
}
