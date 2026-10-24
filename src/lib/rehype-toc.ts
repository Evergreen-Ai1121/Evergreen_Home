/**
 * 目录相关 rehype 插件。
 *
 * 只依赖 hast 节点的最小结构，不引第三方 hast 类型包。
 */
export interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

/** Group MDX by h2 so scroll reveals operate on readable sections, not every line. */
export function rehypeReadingSections() {
  return (tree: HastNode) => {
    const sections: HastNode[] = [];
    let current: HastNode | null = null;
    for (const child of tree.children ?? []) {
      if (child.type === "mdxjsEsm") {
        sections.push(child);
        continue;
      }
      if (!current || (child.type === "element" && child.tagName === "h2")) {
        current = {
          type: "element",
          tagName: "section",
          properties: { className: ["reading-section"] },
          children: [],
        };
        sections.push(current);
      }
      current.children!.push(child);
    }
    tree.children = sections;
  };
}

/**
 * 把 buildHeadings() 生成的 id 按文档顺序写回 h1–h6。
 *
 * 之所以不走 rehype-slug：rehype-slug 独立编号，与目录侧算出的 id 在重名标题
 * 上会错位（它从 h1 起算、目录从 h2 起算）。这里以 buildHeadings 为唯一数据源。
 */
export function rehypeTocIds(ids: string[]) {
  return (tree: HastNode) => {
    let i = 0;
    const walk = (nodes?: HastNode[]) => {
      if (!nodes) return;
      for (const node of nodes) {
        if (node.type === "element" && typeof node.tagName === "string") {
          if (/^h[1-6]$/.test(node.tagName)) {
            const id = ids[i++];
            if (id) node.properties = { ...(node.properties ?? {}), id };
          }
        }
        walk(node.children);
      }
    };
    walk(tree.children);
  };
}

function toFigure(img: HastNode, caption: string): HastNode {
  delete (img.properties ?? {}).title;
  return {
    type: "element",
    tagName: "figure",
    properties: { className: "mdx-figure" },
    children: [
      img,
      {
        type: "element",
        tagName: "figcaption",
        properties: { className: "mdx-caption" },
        children: [{ type: "text", value: caption }],
      },
    ],
  };
}

const captionOf = (img: HastNode): string => {
  const t = (img.properties ?? {}).title;
  return typeof t === "string" ? t : "";
};

/** 段落里只有一张图时返回它，否则 null（图注不能嵌进混排段落，会破坏结构） */
function loneImage(p: HastNode): HastNode | null {
  const kids = (p.children ?? []).filter(
    (c) => c.type === "element" || c.value?.trim(),
  );
  if (kids.length !== 1) return null;
  return kids[0]!.type === "element" && kids[0]!.tagName === "img"
    ? kids[0]!
    : null;
}

/**
 * 把带 title 的图片包成 <figure> + <figcaption>。
 * 语法沿用标准 Markdown：![示意图](/images/a.png "这是图注")
 *
 * 注意：Markdown 的独立图片会被包成 <p><img></p>，而 <figure> 不能放在 <p> 里
 * （浏览器会自动闭合 <p>，进而导致 hydration 不匹配），所以这里是替换整个 <p>。
 */
export function rehypeFigure() {
  return (tree: HastNode) => {
    const walk = (nodes: HastNode[]) => {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.type !== "element") continue;

        if (node.tagName === "p") {
          const img = loneImage(node);
          const caption = img ? captionOf(img) : "";
          if (img && caption) {
            nodes[i] = toFigure(img, caption);
            continue;
          }
        }

        if (node.tagName === "img") {
          const caption = captionOf(node);
          if (caption) {
            nodes[i] = toFigure(node, caption);
            continue;
          }
        }

        walk(node.children ?? []);
      }
    };
    walk(tree.children ?? []);
  };
}
