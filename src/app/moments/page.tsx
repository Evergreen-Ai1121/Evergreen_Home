import { listMoments } from "@/lib/moments";
import { MomentItem } from "@/components/MomentItem";
import { EmptyState, PageHeader } from "@/components/PageHeader";

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
    <div className="mx-auto max-w-reading">
      <PageHeader title="说说" description="此刻的想法、拍到的照片、刚调通的小功能。" />
      {error && <EmptyState>说说服务暂不可用，请稍后再试。</EmptyState>}
      {!error && moments.length === 0 && (
        <EmptyState>说说还没有内容，去 /admin 发一条。</EmptyState>
      )}
      <div className="space-y-4">
        {moments.map((m) => (
          <MomentItem key={m.id} moment={m} />
        ))}
      </div>
    </div>
  );
}
