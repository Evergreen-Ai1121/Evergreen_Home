import { getPage } from "@/lib/content";
import { Mdx } from "@/components/Mdx";
import { EmptyState, PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { T } from "@/components/LangProvider";

export const metadata = { title: "关于" };

export default function AboutPage() {
  const page = getPage("about");

  return (
    /* 不居中：和文章/笔记等页的大标题一样与内容左缘顶格，窄列只约束宽度 */
    <div className="max-w-reading">
      <PageHeader title={<T k="nav.about" />} />
      {page ? (
        /* 正文是大文本块 = LCP 元素，用 rise 只位移不淡入，避免推迟 LCP */
        <Reveal variant="rise">
          <Mdx source={page.content} />
        </Reveal>
      ) : (
        <EmptyState>关于页还没有内容。</EmptyState>
      )}
    </div>
  );
}
