import { getCollection } from "@/lib/content";
import { ContentCard } from "@/components/Cards";
import { EmptyState, PageHeader } from "@/components/PageHeader";

export const metadata = { title: "文章" };

export default function PostsPage() {
  const posts = getCollection("posts");

  return (
    <div className="mx-auto max-w-wide">
      <PageHeader title="文章" description="有开头也有结尾的完整表达，包括日记和随笔。" />
      {posts.length === 0 ? (
        <EmptyState>还没有文章。</EmptyState>
      ) : (
        <div className="grid gap-4 tablet:grid-cols-2">
          {posts.map((p) => (
            <ContentCard key={p.slug} doc={p} />
          ))}
        </div>
      )}
    </div>
  );
}
