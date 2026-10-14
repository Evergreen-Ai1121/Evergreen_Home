import type { DocMeta } from "./content";

/**
 * 详情页相关的纯函数：单独放一个文件，是因为它们会被客户端组件引用，
 * 而 content.ts 里用了 node:fs，进了浏览器 bundle 会直接构建失败。
 */

/** 详情链接：三种类型各自挂在自己的路由前缀下 */
export function hrefOf(doc: Pick<DocMeta, "type" | "slug">): string {
  return `/${doc.type}/${doc.slug}`;
}

/** updated 与 date 不同时才需要在页面上强调「更新于」 */
export function isUpdated(doc: Pick<DocMeta, "date" | "updated">): boolean {
  return Boolean(doc.updated) && doc.updated !== doc.date;
}
