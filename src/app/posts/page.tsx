import { getCollection, getTags } from "@/lib/content";
import { ContentCard } from "@/components/Cards";
import { Pagination } from "@/components/Pagination";
import { EmptyState, PageHeader } from "@/components/PageHeader";
import { TagFilter } from "@/components/TagFilter";

export const metadata = { title: "文章" };

const PAGE_SIZE = 12;

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; page?: string }>;
}) {
  const { tag, page: raw } = await searchParams;
  const all = getCollection("posts");
  const filtered = tag ? all.filter((d) => d.tags.includes(tag)) : all;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(raw) || 1), totalPages);
  const posts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const href = (n: number) => {
    const q = new URLSearchParams();
    if (tag) q.set("tag", tag);
    q.set("page", String(n));
    return `/posts?${q}`;
  };

  return (
    <div className="mx-auto max-w-wide">
      <PageHeader title="文章" description="有开头也有结尾的完整表达，包括日记和随笔。" />
      <TagFilter basePath="/posts" tags={getTags("posts")} active={tag} />
      {posts.length === 0 ? (
        <EmptyState>这个标签下还没有文章。</EmptyState>
      ) : (
        <>
          <div className="grid gap-4 tablet:grid-cols-2">
            {posts.map((p) => (
              <ContentCard key={p.slug} doc={p} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} href={href} />
        </>
      )}
    </div>
  );
}
