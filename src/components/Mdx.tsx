import "katex/dist/katex.min.css";
import Link from "next/link";
import { evaluate } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { cn } from "@/lib/utils";
import { buildHeadings } from "@/lib/content";
import {
  rehypeFigure,
  rehypeTocIds,
  rehypeReadingSections,
} from "@/lib/rehype-toc";
import { remarkLocalImages } from "@/lib/remark-local-images";
import { sizeOf } from "@/lib/image-sizes";
import { CodeBlock } from "./CodeBlock";
import { Callout } from "./Callout";
import { Details } from "./Details";
import { LinkCard } from "./LinkCard";
import { ImageRow, MdxImage, type ImageAlign } from "./MdxImage";

const isInternal = (href: string) =>
  href.startsWith("/") || href.startsWith("#");

/**
 * 拆分图片 URL 上的显示参数：`?w=400`（限宽）与 `?align=left|right`。
 * 只认这两个键，其余查询参数原样保留，避免破坏带签名的外链。
 */
function splitSrc(src: string) {
  const q = src.indexOf("?");
  if (q === -1)
    return { url: src, displayWidth: undefined, align: "center" as ImageAlign };
  const params = new URLSearchParams(src.slice(q + 1));
  const w = Number(params.get("w"));
  const align = params.get("align");
  params.delete("w");
  params.delete("align");
  const rest = params.toString();
  return {
    url: src.slice(0, q) + (rest ? `?${rest}` : ""),
    displayWidth: Number.isFinite(w) && w > 0 ? w : undefined,
    align: (align === "left" || align === "right"
      ? align
      : "center") as ImageAlign,
  };
}

const components = {
  a: ({
    href = "",
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
    isInternal(href) ? (
      <Link href={href} {...rest}>
        {children}
      </Link>
    ) : (
      <a href={href} target="_blank" rel="noreferrer noopener" {...rest}>
        {children}
      </a>
    ),
  img: ({ src = "", alt = "" }: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const { url, displayWidth, align } = splitSrc(String(src));
    const size = sizeOf(url);
    return (
      <MdxImage
        src={url}
        alt={alt}
        width={size?.width}
        height={size?.height}
        displayWidth={displayWidth}
        align={align}
      />
    );
  },
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 overflow-x-auto rounded-card border border-border">
      <table {...props} />
    </div>
  ),
  pre: CodeBlock,
  ImageRow,
  Callout,
  Details,
  LinkCard,
};

export async function Mdx({
  source,
  className,
  base,
}: {
  source: string;
  className?: string;
  /** 形如 "posts/my-post"，用于解析 MDX 里的相对图片路径 */
  base?: string;
}) {
  // jsx runtime 必须由本项目的模块解析（走 Next 的别名），
  // 否则 dev 下 RSC 渲染会因元素缺少调试属性而 500。
  const jsxRuntime =
    process.env.NODE_ENV === "development"
      ? await import("react/jsx-dev-runtime")
      : await import("react/jsx-runtime");

  const options = {
    ...jsxRuntime,
    remarkPlugins: [remarkGfm, remarkMath, [remarkLocalImages, base]],
    rehypePlugins: [
      rehypeReadingSections,
      // 标题 id 由 buildHeadings 统一供给，保证目录锚点与正文一致
      [rehypeTocIds, buildHeadings(source).map((h) => h.id)],
      rehypeFigure,
      [rehypeKatex, { throwOnError: false }],
      [
        rehypeAutolinkHeadings,
        { behavior: "wrap", properties: { className: "no-underline" } },
      ],
      [
        rehypePrettyCode,
        {
          theme: { light: "github-light", dark: "github-dark" },
          keepBackground: false,
          defaultLang: "txt",
        },
      ],
    ],
    development: process.env.NODE_ENV !== "production",
  } as Parameters<typeof evaluate>[1];

  const { default: MDXContent } = await evaluate(source, options);

  return (
    <div
      className={cn(
        "prose prose-neutral max-w-none dark:prose-invert",
        className,
      )}
    >
      <MDXContent components={components} />
    </div>
  );
}
