import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { getAllSlugs, getDoc } from "@/lib/content";
import { Mdx } from "@/components/Mdx";
import { TableOfContents } from "@/components/TableOfContents";
import { TagChip } from "@/components/Cards";
import { Comments } from "@/components/Comments";
import { PageHeader } from "@/components/PageHeader";
import { License } from "@/components/License";
import { SafeImage } from "@/components/SafeImage";

export function generateStaticParams() {
  return getAllSlugs("posts").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc("posts", slug);
  if (!doc) return {};
  return { title: doc.title, description: doc.summary };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc("posts", slug);
  if (!doc) notFound();

  return (
    <div className="desktop:mx-auto desktop:max-w-wide">
      <div className="desktop:grid desktop:grid-cols-[720px_240px] desktop:justify-center desktop:gap-10">
        <article className="mx-auto min-w-0 max-w-reading desktop:mx-0">
          <PageHeader title={doc.title} description={doc.summary} />
          <div className="mb-8 flex flex-wrap items-center gap-3 text-xs text-text-muted">
            <time dateTime={doc.date}>{doc.date}</time>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
              {doc.readingTime} 分钟
            </span>
          </div>

          {doc.cover && (
            <div className="mb-8 overflow-hidden rounded-card border border-border">
              <SafeImage src={doc.cover} alt="" ratio="16 / 9" />
            </div>
          )}

          <TableOfContents items={doc.toc} variant="floating" />
          <Mdx source={doc.content} />

          {doc.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
              {doc.tags.map((t) => (
                <TagChip key={t} name={t} />
              ))}
            </div>
          )}

          <License title={doc.title} path={`/posts/${doc.slug}`} />

          <Comments slug={doc.slug} />
        </article>
        <TableOfContents items={doc.toc} variant="sidebar" />
      </div>
    </div>
  );
}
