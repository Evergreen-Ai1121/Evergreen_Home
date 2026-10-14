import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getDoc, getRelated, getSiblings } from "@/lib/content";
import { Mdx } from "@/components/Mdx";
import { TableOfContents } from "@/components/TableOfContents";
import { TagChip } from "@/components/Cards";
import { PageHeader } from "@/components/PageHeader";
import { License } from "@/components/License";
import { ReadingProgress } from "@/components/ReadingProgress";
import { DocMetaRow } from "@/components/DocMetaRow";
import { ShareBar } from "@/components/ShareBar";
import { PrevNext } from "@/components/PrevNext";
import { RelatedList } from "@/components/RelatedList";

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
  const { prev, next } = getSiblings("notes", slug);
  const related = getRelated(doc);

  return (
    <div className="desktop:mx-auto desktop:max-w-wide">
      <ReadingProgress />
      <div className="desktop:grid desktop:grid-cols-[720px_240px] desktop:justify-center desktop:gap-10">
        <article className="mx-auto min-w-0 max-w-reading desktop:mx-0">
          <PageHeader title={doc.title} description={doc.summary} />
          <DocMetaRow doc={doc}>
            {doc.category && (
              <Link
                href={`/notes?category=${encodeURIComponent(doc.category)}`}
                className="rounded-pill bg-accent-soft px-2.5 py-0.5 text-accent"
              >
                {doc.category}
              </Link>
            )}
          </DocMetaRow>

          <TableOfContents items={doc.toc} variant="floating" />
          <Mdx source={doc.content} base={`notes/${doc.slug}`} />

          {doc.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
              {doc.tags.map((t) => (
                <TagChip key={t} name={t} href={`/tags/${encodeURIComponent(t)}`} />
              ))}
            </div>
          )}

          <ShareBar title={doc.title} />

          <License title={doc.title} path={`/notes/${doc.slug}`} />

          <PrevNext prev={prev} next={next} />
          <RelatedList items={related} />
        </article>
        <TableOfContents items={doc.toc} variant="sidebar" />
      </div>
    </div>
  );
}
