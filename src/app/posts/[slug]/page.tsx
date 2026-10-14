import { notFound } from "next/navigation";
import { getAllSlugs, getDoc, getRelated, getSiblings } from "@/lib/content";
import { Mdx } from "@/components/Mdx";
import { TableOfContents } from "@/components/TableOfContents";
import { TagChip } from "@/components/Cards";
import { Comments } from "@/components/Comments";
import { PageHeader } from "@/components/PageHeader";
import { License } from "@/components/License";
import { SafeImage } from "@/components/SafeImage";
import { ReadingProgress } from "@/components/ReadingProgress";
import { DocMetaRow } from "@/components/DocMetaRow";
import { ShareBar } from "@/components/ShareBar";
import { PrevNext } from "@/components/PrevNext";
import { RelatedList } from "@/components/RelatedList";

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
  const { prev, next } = getSiblings("posts", slug);
  const related = getRelated(doc);

  return (
    <div className="desktop:mx-auto desktop:max-w-wide">
      <ReadingProgress />
      <div className="desktop:grid desktop:grid-cols-[720px_240px] desktop:justify-center desktop:gap-10">
        <article className="mx-auto min-w-0 max-w-reading desktop:mx-0">
          <PageHeader title={doc.title} description={doc.summary} />
          <DocMetaRow doc={doc} />

          {doc.cover && (
            <div className="mb-8 overflow-hidden rounded-card border border-border">
              <SafeImage src={doc.cover} alt="" ratio="16 / 9" />
            </div>
          )}

          <TableOfContents items={doc.toc} variant="floating" />
          <Mdx source={doc.content} base={`posts/${doc.slug}`} />

          {doc.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
              {doc.tags.map((t) => (
                <TagChip key={t} name={t} href={`/tags/${encodeURIComponent(t)}`} />
              ))}
            </div>
          )}

          <ShareBar title={doc.title} />

          <License title={doc.title} path={`/posts/${doc.slug}`} />

          <PrevNext prev={prev} next={next} />
          <RelatedList items={related} />

          <Comments slug={doc.slug} />
        </article>
        <TableOfContents items={doc.toc} variant="sidebar" />
      </div>
    </div>
  );
}
