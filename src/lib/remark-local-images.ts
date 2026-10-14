import fs from "node:fs";
import path from "node:path";

interface MdastNode {
  type: string;
  url?: string;
  children?: MdastNode[];
}

/**
 * 把 MDX 里的相对图片路径重写到 /content-images/<type>/<slug>/…
 *
 * 图片放在与 .mdx 同名的目录下：
 *   content/posts/my-post.mdx
 *   content/posts/my-post/cover.png
 * MDX 里写 ![封面](./cover.png)
 *
 * 绝对路径（/images/…）与外链原样保留；目标文件不存在时也不重写，
 * 让坏链在页面上直接暴露，而不是静默变成另一个 404。
 */
export function remarkLocalImages(base?: string) {
  return (tree: MdastNode) => {
    if (!base) return;

    const resolve = (ref: string): string | null => {
      if (/^(https?:)?\/\//.test(ref) || ref.startsWith("/") || ref.startsWith("data:")) return null;
      const q = ref.indexOf("?");
      const refPath = q === -1 ? ref : ref.slice(0, q);
      const query = q === -1 ? "" : ref.slice(q);
      const clean = path.posix.normalize(path.posix.join(base, refPath));
      if (clean.startsWith("..")) return null;
      const abs = path.join(process.cwd(), "public", "content-images", clean);
      if (!fs.existsSync(abs)) return null;
      return `/content-images/${clean}${query}`;
    };

    const walk = (nodes?: MdastNode[]) => {
      if (!nodes) return;
      for (const node of nodes) {
        if (node.type === "image" && typeof node.url === "string") {
          const next = resolve(node.url);
          if (next) node.url = next;
        }
        walk(node.children);
      }
    };
    walk(tree.children);
  };
}
