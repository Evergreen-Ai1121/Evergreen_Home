import { getCollection } from "@/lib/content";
import { ContentCard } from "@/components/Cards";
import { Pagination } from "@/components/Pagination";
import { EmptyState, PageHeader } from "@/components/PageHeader";

export const metadata = { title: "文章" };

const PAGE_SIZE = 12;

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: raw } = await searchParams;
  const all = getCollection("posts");
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(raw) || 1), totalPages);
  const posts = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-wide">
      <PageHeader title="文章" description="有开头也有结尾的完整表达，包括日记和随笔。" />
      {posts.length === 0 ? (
        <EmptyState>还没有文章。</EmptyState>
      ) : (
        <>
          <div className="grid gap-4 tablet:grid-cols-2">
            {posts.map((p) => (
              <ContentCard key={p.slug} doc={p} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} href={(n) => `/posts?page=${n}`} />
        </>
      )}
    </div>
  );
}
