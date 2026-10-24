import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Mail,
  Download,
  Github,
  Rss,
} from "lucide-react";
import type { DocMeta } from "@/lib/content";
import { getEvidence } from "@/lib/content";
import { hrefOf } from "@/lib/doc";
import { site } from "@/lib/site";
import { T } from "./LangProvider";
import { LocalDate } from "./LocalDate";
import { SafeImage } from "./SafeImage";
import type { DictKey } from "@/lib/i18n";

export function SectionHeading({
  number,
  title,
  description,
  href,
}: {
  number: string;
  title: DictKey;
  description?: DictKey;
  href?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">
          <span className="text-accent">{number}</span> / EVERGREEN
        </p>
        <h2>
          <T k={title} />
        </h2>
        {description && (
          <p className="mt-3 max-w-xl text-sm text-text-muted">
            <T k={description} />
          </p>
        )}
      </div>
      {href && (
        <Link href={href} className="text-link">
          <T k="action.viewAll" />
          <ArrowUpRight size={16} />
        </Link>
      )}
    </div>
  );
}

export function ProjectExhibit({
  doc,
  index = 0,
  large = false,
}: {
  doc: DocMeta;
  index?: number;
  large?: boolean;
}) {
  return (
    <Link
      href={hrefOf(doc)}
      className={`project-exhibit group ${large ? "project-exhibit-large" : ""}`}
    >
      <div className="project-preview">
        {doc.cover ? (
          <SafeImage src={doc.cover} alt={doc.title} ratio="16 / 10" />
        ) : (
          <div className="type-cover">
            <div className="flex items-center justify-between">
              <span className="eyebrow">
                <T k={`projects.${doc.projectCategory}` as DictKey} />
              </span>
              <span className="font-mono text-xs">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div>
              <h3>{doc.title}</h3>
              <p className="mt-3 line-clamp-3 text-sm text-text-muted">
                {doc.summary}
              </p>
            </div>
            <div className="cover-rule" />
          </div>
        )}
      </div>
      <div className="project-caption">
        <p className="eyebrow">
          <T k={`projects.${doc.projectCategory}` as DictKey} />
          {doc.period && <> / {doc.period}</>}
        </p>
        <h3 className="mt-4 text-2xl font-semibold tracking-tight">
          {doc.title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-text-muted">{doc.summary}</p>
        {doc.contribution && (
          <p className="mt-4 text-sm">
            <span className="text-text-muted">
              <T k="projects.contribution" /> ·{" "}
            </span>
            {doc.contribution}
          </p>
        )}
        {doc.outcome && (
          <p className="mt-2 text-sm">
            <span className="text-text-muted">
              <T k="projects.outcome" /> ·{" "}
            </span>
            {doc.outcome}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-2">
          {doc.stack.slice(0, 3).map((item) => (
            <span className="tech-label" key={item}>
              {item}
            </span>
          ))}
        </div>
        <span className="mt-7 inline-flex items-center gap-3 text-sm text-accent">
          <T k="projects.explore" />
          <ArrowUpRight size={17} />
        </span>
      </div>
    </Link>
  );
}

export function WritingRow({ doc, index }: { doc: DocMeta; index?: number }) {
  return (
    <Link href={hrefOf(doc)} className="writing-row group">
      <span className="writing-index">
        {index === undefined ? (
          <span className="writing-dot" />
        ) : (
          String(index + 1).padStart(2, "0")
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
          <span className="text-accent">
            <T k={doc.type === "notes" ? "nav.notes" : "nav.posts"} />
          </span>
          <LocalDate date={doc.date} />
          <span>
            {doc.readingTime} <T k="label.minRead" />
          </span>
          <span>
            <T k="label.contentLanguage" />
          </span>
        </div>
        <h3 className="text-lg font-medium transition-colors group-hover:text-accent">
          {doc.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-text-muted">
          {doc.summary}
        </p>
      </div>
      {doc.cover && (
        <div className="hidden w-28 shrink-0 overflow-hidden rounded-control tablet:block">
          <SafeImage src={doc.cover} alt="" ratio="4 / 3" />
        </div>
      )}
      <ArrowUpRight
        size={20}
        className="shrink-0 text-text-muted transition-colors group-hover:text-accent"
      />
    </Link>
  );
}

export function Evidence() {
  const evidence = getEvidence();
  if (!evidence.length) return null;
  return (
    <div className="evidence-grid">
      {evidence.map((group, i) => (
        <article key={group.key} className="evidence-card">
          <span className="eyebrow text-accent">0{i + 1} /</span>
          <h3 className="mb-5 mt-4 text-xl font-medium">
            <T k={`evidence.${group.key}` as DictKey} />
          </h3>
          {group.docs.map((doc) => (
            <Link
              href={hrefOf(doc)}
              key={`${doc.type}/${doc.slug}`}
              className="evidence-link"
            >
              <span>{doc.title}</span>
              <ArrowUpRight size={16} className="shrink-0" />
            </Link>
          ))}
        </article>
      ))}
    </div>
  );
}

export function ContactLinks({ resume = false }: { resume?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {site.email && (
        <a className="button-primary" href={`mailto:${site.email}`}>
          <Mail size={17} />
          <T k="home.mail" />
        </a>
      )}
      {site.github && (
        <a
          className="button-secondary"
          href={site.github}
          target="_blank"
          rel="noreferrer noopener"
        >
          <Github size={17} />
          GitHub
          <ArrowUpRight size={14} />
        </a>
      )}
      {resume && site.resume && (
        <a className="button-secondary" href={site.resume} download>
          <Download size={17} />
          <T k="about.resume" />
        </a>
      )}
    </div>
  );
}

export function EmptyProjects() {
  return (
    <div className="empty-projects">
      <div className="empty-orbit" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div>
        <p className="eyebrow">EXPLORATIONS IN PROGRESS</p>
        <h3 className="mt-4 text-2xl font-medium">
          <T k="home.noWork" />
        </h3>
        <p className="mt-3 max-w-lg text-sm leading-7 text-text-muted">
          <T k="home.noWorkDesc" />
        </p>
        <Link href="/blog" className="text-link mt-6">
          <T k="blog.browse" />
          <ArrowRight size={17} />
        </Link>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Link href="/" className="font-display text-xl">
          Evergreen<span className="text-accent">.</span>
        </Link>
        <p className="mt-2 text-xs text-text-muted">
          <T k="footer.note" />
        </p>
      </div>
      <nav
        aria-label="Footer"
        className="flex flex-wrap gap-5 text-sm text-text-muted"
      >
        {site.email && (
          <a href={`mailto:${site.email}`} className="text-link">
            <Mail size={15} />
            <T k="social.mail" />
          </a>
        )}
        {site.github && (
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer noopener"
            className="text-link"
          >
            <Github size={15} />
            GitHub
          </a>
        )}
        <a className="text-link" href="/rss.xml">
          <Rss size={15} />
          RSS
        </a>
        <Link href="/tags" className="text-link">
          <T k="nav.tags" />
        </Link>
        <Link href="/archive" className="text-link">
          <T k="nav.archive" />
        </Link>
      </nav>
      <p className="text-xs text-text-muted">
        © {new Date().getFullYear()} Evergreen
      </p>
    </footer>
  );
}
