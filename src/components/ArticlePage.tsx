import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import {
  getDoc,
  getRelated,
  getExplicitRelated,
  getSiblings,
  type CollectionType,
} from "@/lib/content";
import { Mdx } from "./Mdx";
import { TableOfContents } from "./TableOfContents";
import { PageHeader } from "./PageHeader";
import { DocMetaRow } from "./DocMetaRow";
import { ReadingProgress } from "./ReadingProgress";
import { SafeImage } from "./SafeImage";
import { ShareBar } from "./ShareBar";
import { PrevNext } from "./PrevNext";
import { RelatedList } from "./RelatedList";
import { T } from "./LangProvider";

export async function ArticlePage({
  type,
  slug,
}: {
  type: CollectionType;
  slug: string;
}) {
  const doc = getDoc(type, slug);
  if (!doc) notFound();
  const project = type === "projects";
  const siblings = getSiblings(type, slug);
  const explicit = getExplicitRelated(doc);
  const related = [...explicit, ...getRelated(doc)]
    .filter(
      (item, index, all) =>
        all.findIndex(
          (other) => other.type === item.type && other.slug === item.slug,
        ) === index,
    )
    .slice(0, 4);
  return (
    <div className="article-shell">
      <ReadingProgress />
      <article lang={doc.language}>
        <Link href={project ? "/projects" : "/blog"} className="text-link mb-6">
          ← <T k={project ? "nav.projects" : "nav.blog"} />
        </Link>
        <PageHeader title={doc.title} description={doc.summary} />
        <DocMetaRow doc={doc}>
          <span className="tech-label">
            {doc.language === "zh-CN" ? (
              <T k="label.contentLanguage" />
            ) : (
              doc.language
            )}
          </span>
        </DocMetaRow>
        {project && (
          <>
            <dl className="mb-8 grid gap-4 rounded-card border border-border bg-surface p-6 tablet:grid-cols-2">
              {doc.role && (
                <div>
                  <dt className="text-xs text-text-muted">
                    <T k="projects.role" />
                  </dt>
                  <dd className="mt-1 text-sm">{doc.role}</dd>
                </div>
              )}
              {doc.period && (
                <div>
                  <dt className="text-xs text-text-muted">
                    <T k="projects.period" />
                  </dt>
                  <dd className="mt-1 text-sm">{doc.period}</dd>
                </div>
              )}
              {doc.contribution && (
                <div className="tablet:col-span-2">
                  <dt className="text-xs text-text-muted">
                    <T k="projects.contribution" />
                  </dt>
                  <dd className="mt-1 text-sm">{doc.contribution}</dd>
                </div>
              )}
              {doc.outcome && (
                <div className="tablet:col-span-2">
                  <dt className="text-xs text-text-muted">
                    <T k="projects.outcome" />
                  </dt>
                  <dd className="mt-1 text-sm">{doc.outcome}</dd>
                </div>
              )}
            </dl>
            {doc.stack.length > 0 && (
              <div className="mb-8 flex flex-wrap gap-2">
                {doc.stack.map((item) => (
                  <span className="tech-label" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            )}
            {doc.links.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-4 text-sm">
                  <T k="projects.links" />
                </h2>
                <div className="flex flex-wrap gap-3">
                  {doc.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="button-secondary"
                    >
                      {link.label}
                      <ArrowUpRight size={15} />
                    </a>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
        {doc.cover && (
          <div className="mb-8 overflow-hidden rounded-card border border-border">
            <SafeImage
              src={doc.cover}
              alt=""
              ratio="16 / 9"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        )}
        <TableOfContents items={doc.toc} variant="floating" />
        <Mdx source={doc.content} base={`${doc.type}/${doc.slug}`} />
        {doc.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {doc.tags.map((tag) => (
              <Link
                href={`/tags/${encodeURIComponent(tag)}`}
                className="filter-chip active"
                key={tag}
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
        <ShareBar title={doc.title} />
        <PrevNext {...siblings} />
        <RelatedList items={related} />
      </article>
      <TableOfContents items={doc.toc} variant="sidebar" />
    </div>
  );
}
