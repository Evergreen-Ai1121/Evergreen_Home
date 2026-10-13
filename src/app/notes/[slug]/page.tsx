import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { getAllSlugs, getDoc } from "@/lib/content";
import { Mdx } from "@/components/Mdx";
import { TableOfContents } from "@/components/TableOfContents";
import { TagChip } from "@/components/Cards";
import { PageHeader } from "@/components/PageHeader";
import { License } from "@/components/License";

export function generateStaticParams() {
  return getAllSlugs("notes").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc("notes", slug);
  if (!doc) return {};
  return { title: doc.title, description: doc.summary };
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc("notes", slug);
  if (!doc) notFound();

  return (
    <div className="desktop:mx-auto desktop:max-w-wide">
      <div className="desktop:grid desktop:grid-cols-[720px_240px] desktop:justify-center desktop:gap-10">
        <article className="mx-auto min-w-0 max-w-reading desktop:mx-0">
          <PageHeader title={doc.title} description={doc.summary} />
          <div className="mb-8 flex flex-wrap items-center gap-3 text-xs text-text-muted">
            {doc.category && (
              <Link
                href={`/notes?category=${encodeURIComponent(doc.category)}`}
                className="rounded-pill bg-accent-soft px-2.5 py-0.5 text-accent"
              >
                {doc.category}
              </Link>
            )}
            <time dateTime={doc.date}>{doc.date}</time>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
              {doc.readingTime} 分钟
            </span>
          </div>

          <TableOfContents items={doc.toc} variant="inline" />
          <Mdx source={doc.content} />

          {doc.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
              {doc.tags.map((t) => (
                <TagChip key={t} name={t} href={`/notes?tag=${encodeURIComponent(t)}`} />
              ))}
            </div>
          )}

          <License title={doc.title} path={`/notes/${doc.slug}`} />
        </article>
        <TableOfContents items={doc.toc} variant="sidebar" />
      </div>
    </div>
  );
}
