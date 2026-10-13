import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { cn } from "@/lib/utils";

const isInternal = (href: string) => href.startsWith("/") || href.startsWith("#");

const components = {
  a: ({ href = "", children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
    isInternal(href) ? (
      <Link href={href} {...rest}>
        {children}
      </Link>
    ) : (
      <a href={href} target="_blank" rel="noreferrer noopener" {...rest}>
        {children}
      </a>
    ),
  // eslint-disable-next-line @next/next/no-img-element
  img: ({ alt = "", ...rest }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      alt={alt}
      loading="lazy"
      decoding="async"
      className="my-6 w-full rounded-card border border-border"
      {...rest}
    />
  ),
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 overflow-x-auto rounded-card border border-border">
      <table {...props} />
    </div>
  ),
};

export async function Mdx({ source, className }: { source: string; className?: string }) {
  const { content } = await compileMDX({
    source,
    components,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [
          rehypeSlug,
          [rehypeKatex, { throwOnError: false }],
          [rehypeAutolinkHeadings, { behavior: "wrap", properties: { className: "no-underline" } }],
          [
            rehypePrettyCode,
            {
              theme: { light: "github-light", dark: "github-dark" },
              keepBackground: false,
              defaultLang: "txt",
            },
          ],
        ],
      },
    },
  });

  return (
    <div className={cn("prose prose-neutral max-w-none dark:prose-invert", className)}>
      {content}
    </div>
  );
}
