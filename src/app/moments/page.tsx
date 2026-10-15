import { listMoments } from "@/lib/moments";
import { MomentItem } from "@/components/MomentItem";
import { EmptyState, PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { T } from "@/components/LangProvider";

export const metadata = { title: "说说" };
export const revalidate = 60;

export default async function MomentsPage() {
  let moments: Awaited<ReturnType<typeof listMoments>> = [];
  let error = false;
  try {
    moments = await listMoments(50);
  } catch {
    error = true;
  }

  return (
    /* 不居中：和文章/笔记等页的大标题一样与内容左缘顶格，窄列只约束宽度 */
    <div className="max-w-reading">
      <PageHeader title={<T k="nav.moments" />} description={<T k="desc.moments" />} />
      {error && <EmptyState>说说服务暂不可用，请稍后再试。</EmptyState>}
      {!error && moments.length === 0 && (
        <EmptyState>说说还没有内容，去 /admin 发一条。</EmptyState>
      )}
      <div className="space-y-4">
        {moments.map((m, i) => (
          /* 说说正文是大文本块 = LCP 候选，用 rise 只位移不淡入 */
          <Reveal key={m.id} index={i} variant="rise">
            <MomentItem moment={m} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
