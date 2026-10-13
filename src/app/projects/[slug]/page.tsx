import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getAllSlugs, getDoc } from "@/lib/content";
import { Mdx } from "@/components/Mdx";
import { TableOfContents } from "@/components/TableOfContents";
import { PageHeader } from "@/components/PageHeader";
import { SafeImage } from "@/components/SafeImage";
import { GlassCard } from "@/components/GlassCard";

export function generateStaticParams() {
  return getAllSlugs("projects").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc("projects", slug);
  if (!doc) return {};
  return { title: doc.title, description: doc.summary };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc("projects", slug);
  if (!doc) notFound();

  return (
    <div className="wide:mx-auto wide:max-w-wide">
      <div className="wide:grid wide:grid-cols-[720px_240px] wide:justify-center wide:gap-10">
        <article className="mx-auto min-w-0 max-w-reading wide:mx-0">
          <PageHeader title={doc.title} description={doc.summary} />

          {doc.cover && (
            <div className="mb-8 overflow-hidden rounded-card border border-border">
              <SafeImage src={doc.cover} alt={`${doc.title} 封面`} ratio="16 / 9" />
            </div>
          )}

          {doc.stack.length > 0 && (
            <GlassCard className="mb-8 p-4">
              <h2 className="mb-2 text-xs uppercase tracking-wide text-text-muted">技术栈</h2>
              <div className="flex flex-wrap gap-2">
                {doc.stack.map((s) => (
                  <span
                    key={s}
                    className="rounded-pill border border-border bg-surface px-3 py-1 text-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </GlassCard>
          )}

          {doc.links.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-3">
              {doc.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 rounded-control border border-border bg-surface px-4 py-2 text-sm transition-colors hover:bg-surface-strong"
                >
                  {l.label}
                  <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          )}

          <TableOfContents items={doc.toc} variant="floating" />
          <Mdx source={doc.content} />
        </article>
        <TableOfContents items={doc.toc} variant="sidebar" />
      </div>
    </div>
  );
}
