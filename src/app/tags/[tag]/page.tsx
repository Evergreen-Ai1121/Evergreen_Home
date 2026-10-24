import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllTags, getDocsByTag } from "@/lib/content";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { ContentCard, NoteItem, ProjectCard } from "@/components/Cards";
import { T } from "@/components/LangProvider";

/** 标签页进不去 "#xxx" 这种非法 slug 时给 404，其余正常渲染 */
export function generateStaticParams() {
  return getAllTags().map((t) => ({ tag: t.name }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const label = decodeURIComponent(tag);
  if (!getDocsByTag(label).length) notFound();
  return pageMetadata(
    "#" + label,
    "探索与 " + label + " 相关的项目和写作。",
    "/tags/" + encodeURIComponent(label),
  );
}

function cardOf(doc: Parameters<typeof ContentCard>[0]["doc"]) {
  if (doc.type === "notes") return <NoteItem doc={doc} />;
  if (doc.type === "projects") return <ProjectCard doc={doc} />;
  return <ContentCard doc={doc} />;
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: raw } = await params;
  const tag = decodeURIComponent(raw);
  const docs = getDocsByTag(tag);
  if (docs.length === 0) notFound();

  return (
    <div className="mx-auto max-w-wide">
      <PageHeader
        title={`#${tag}`}
        description={<T k="tag.summary" values={{ n: docs.length }} />}
      >
        <Link
          href="/tags"
          className="mt-4 inline-block text-sm text-accent hover:underline"
        >
          <T k="label.backToTags" />
        </Link>
      </PageHeader>
      <div className="grid gap-6">
        {docs.map((d, i) => (
          <Reveal
            key={`${d.type}-${d.slug}`}
            index={i}
            variant="rise"
            className="h-full [&>*]:h-full"
          >
            {cardOf(d)}
          </Reveal>
        ))}
      </div>
    </div>
  );
}
