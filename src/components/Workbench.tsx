"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Code2,
  FileText,
  Folder,
  FolderOpen,
  LayoutDashboard,
  Mail,
  PanelLeft,
  Search,
  X,
  Rss,
  CornerDownRight,
  Layers,
  Hash,
} from "lucide-react";
import type { DocMeta, TocItem } from "@/lib/content";
import { hrefOf } from "@/lib/doc";
import { site } from "@/lib/site";
import { formatDate, type DictKey } from "@/lib/i18n";
import { recentTabs, resolveWorkspace, workspaceHref } from "@/lib/workbench";
import { trapTab } from "@/lib/focus";
import { useLang } from "./LangProvider";
import { useSearch } from "./SearchProvider";

export interface WorkbenchDoc extends DocMeta {
  id: string;
  headings: TocItem[];
}
interface EvidenceGroup {
  key: string;
  refs: string[];
}
const STORAGE = "evergreen:workspace-tabs:v1";

export function Workbench({
  docs,
  evidence,
}: {
  docs: WorkbenchDoc[];
  evidence: EvidenceGroup[];
}) {
  const { t, lang } = useLang();
  const search = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { open: openSearch } = useSearch();
  const { view, selected, tag } = resolveWorkspace(
    {
      view: search.get("view"),
      doc: search.get("doc"),
      tag: search.get("tag"),
    },
    docs,
  );
  const [tabs, setTabs] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [directory, setDirectory] = useState(false);
  const [expanded, setExpanded] = useState({ projects: true, writing: true });
  const directoryRef = useRef<HTMLElement>(null);
  const directoryTrigger = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const idsKey = docs.map((doc) => doc.id).join("|");
  const writings = docs.filter((doc) => doc.type !== "projects");
  const projects = docs
    .filter((doc) => doc.type === "projects")
    .sort((a, b) => a.order - b.order || b.date.localeCompare(a.date));
  const featured = writings.filter((doc) => doc.featured).slice(0, 3);
  const highlights = featured.length ? featured : writings.slice(0, 3);
  const scope = view === "projects" ? projects : writings;
  const filtered = scope.filter((doc) => !tag || doc.tags.includes(tag));
  const related = selected
    ? docs
        .filter(
          (doc) =>
            doc.id !== selected.id &&
            (selected.related.includes(doc.id) ||
              doc.related.includes(selected.id) ||
              doc.tags.some((label) => selected.tags.includes(label))),
        )
        .slice(0, 3)
    : [];
  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const doc of docs.filter((item) => item.type !== "projects"))
      for (const label of doc.tags)
        counts.set(label, (counts.get(label) || 0) + 1);
    return [...counts]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh"))
      .slice(0, 8);
  }, [docs]);
  const viewTitle = t(
    view === "overview"
      ? "wb.overview"
      : view === "projects"
        ? "wb.projects"
        : "wb.writing",
  );
  const currentKey = selected?.id || `${view}:${tag}`;
  const previousKey = useRef(currentKey);

  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(
        sessionStorage.getItem(STORAGE) || "[]",
      );
      if (Array.isArray(saved))
        setTabs(
          [
            ...new Set(
              saved.filter(
                (id): id is string =>
                  typeof id === "string" && idsKey.split("|").includes(id),
              ),
            ),
          ].slice(-5),
        );
    } catch {
      /* Storage is optional. */
    }
    setHydrated(true);
  }, [idsKey]);
  useEffect(() => {
    if (hydrated && selected)
      setTabs((previous) =>
        recentTabs(previous, selected.id, idsKey.split("|")),
      );
  }, [selected?.id, hydrated, idsKey]);
  useEffect(() => {
    if (hydrated) {
      try {
        sessionStorage.setItem(STORAGE, JSON.stringify(tabs));
      } catch {
        /* Storage is optional. */
      }
    }
  }, [tabs, hydrated]);
  useEffect(() => {
    if (previousKey.current !== currentKey) {
      previousKey.current = currentKey;
      stageRef.current?.focus({ preventScroll: true });
      if (stageRef.current && stageRef.current.getBoundingClientRect().top < 30)
        stageRef.current.scrollIntoView({
          behavior: "instant",
          block: "start",
        });
    }
    setDirectory(false);
  }, [currentKey, pathname]);
  useEffect(() => {
    if (!directory) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    directoryRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDirectory(false);
      if (event.key === "Tab") trapTab(event, directoryRef.current);
    };
    const resize = () => {
      if (window.innerWidth >= 900) setDirectory(false);
    };
    window.addEventListener("keydown", key);
    window.addEventListener("resize", resize);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", resize);
      directoryTrigger.current?.focus();
    };
  }, [directory]);

  const closeTab = (id: string) => {
    const remaining = tabs.filter((value) => value !== id);
    setTabs(remaining);
    if (selected?.id === id) {
      const next = docs.find((doc) => doc.id === remaining.at(-1));
      router.push(
        next
          ? workspaceHref(
              next.type === "projects" ? "projects" : "writing",
              next.id,
            )
          : workspaceHref("overview"),
        { scroll: false },
      );
    }
  };
  const fileLink = (doc: WorkbenchDoc, compact = false) => (
    <Link
      key={doc.id}
      href={workspaceHref(
        doc.type === "projects" ? "projects" : "writing",
        doc.id,
      )}
      scroll={false}
      className={`${compact ? "wb-tree-file" : "wb-entry"} ${selected?.id === doc.id ? "is-current" : ""}`}
      aria-current={selected?.id === doc.id ? "page" : undefined}
      onClick={() => setDirectory(false)}
    >
      {compact ? (
        <>
          <FileText
            size={14}
            className={
              doc.type === "projects" ? "text-accent" : "text-text-muted"
            }
          />
          <span>{doc.title}</span>
        </>
      ) : (
        <>
          <span className="wb-file-symbol">
            {doc.type === "projects" ? (
              <Layers size={21} strokeWidth={1.4} />
            ) : (
              <FileText size={20} strokeWidth={1.4} />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="wb-entry-meta">
              <span>
                {t(
                  doc.type === "notes"
                    ? "nav.notes"
                    : doc.type === "posts"
                      ? "nav.posts"
                      : "nav.projects",
                )}
              </span>
              <time dateTime={doc.date}>{formatDate(doc.date, lang)}</time>
              <span>
                {doc.readingTime} {t("label.minRead")}
              </span>
            </div>
            <h3 lang={doc.language}>{doc.title}</h3>
            <p lang={doc.language}>{doc.summary}</p>
          </div>
          <ArrowUpRight size={17} className="shrink-0 text-text-muted" />
        </>
      )}
    </Link>
  );
  const sectionHeading = (label: DictKey, number: string, href?: string) => (
    <div className="wb-section-heading">
      <div>
        <span>{number}</span>
        <h2>{t(label)}</h2>
      </div>
      {href && (
        <Link href={href} scroll={false} className="text-link">
          {t("action.viewAll")}
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );

  return (
    <div className="workbench">
      <div className="wb-toolbar">
        <div className="flex items-center gap-3">
          <span className="wb-app-icon">
            <Code2 size={17} />
          </span>
          <span className="eyebrow">EVERGREEN / PERSONAL WORKSPACE</span>
        </div>
        <span className="wb-toolbar-note">{t("wb.toolbarNote")}</span>
        <button
          type="button"
          ref={directoryTrigger}
          className="wb-directory-trigger icon-button"
          onClick={() => setDirectory(true)}
          aria-label={t("wb.openDirectory")}
          aria-expanded={directory}
        >
          <PanelLeft size={18} />
        </button>
      </div>
      <div className="wb-layout">
        {directory && (
          <button
            type="button"
            className="wb-directory-backdrop"
            onClick={() => setDirectory(false)}
            aria-label={t("wb.closeDirectory")}
            tabIndex={-1}
          />
        )}
        <aside
          ref={directoryRef}
          className={`wb-sidebar ${directory ? "is-open" : ""}`}
          role={directory ? "dialog" : undefined}
          aria-modal={directory ? true : undefined}
          aria-label={t("wb.directory")}
        >
          <div className="wb-drawer-close">
            <span>{t("wb.directory")}</span>
            <button
              className="icon-button"
              type="button"
              onClick={() => setDirectory(false)}
              aria-label={t("wb.closeDirectory")}
            >
              <X size={18} />
            </button>
          </div>
          <div className="wb-profile">
            <img src={site.avatar} alt="" width={52} height={52} />
            <div>
              <strong>
                {site.author}
                <span className="text-accent">.</span>
              </strong>
              <span>AI / FULL-STACK</span>
            </div>
          </div>
          <p className="wb-profile-description">
            {lang === "en" ? site.directionEn : site.direction}
          </p>
          <a href={`mailto:${site.email}`} className="wb-profile-contact">
            <Mail size={13} />
            {t("home.mail")}
            <ArrowUpRight size={13} />
          </a>
          <div className="wb-directory-label">
            {t("wb.explorer")}
            <span>{docs.length}</span>
          </div>
          <Link
            href="/"
            scroll={false}
            className={`wb-folder ${view === "overview" ? "is-current" : ""}`}
            onClick={() => setDirectory(false)}
            aria-current={view === "overview" ? "page" : undefined}
          >
            <LayoutDashboard size={16} />
            <span>{t("wb.overview")}</span>
          </Link>
          {(["projects", "writing"] as const).map((kind) => (
            <div className="wb-tree-group" key={kind}>
              <div className="wb-folder-row">
                <button
                  type="button"
                  className="wb-tree-toggle"
                  onClick={() =>
                    setExpanded((old) => ({ ...old, [kind]: !old[kind] }))
                  }
                  aria-label={`${t(expanded[kind] ? "wb.collapse" : "wb.expand")} ${t(kind === "projects" ? "wb.projects" : "wb.writing")}`}
                  aria-expanded={expanded[kind]}
                  aria-controls={`tree-${kind}`}
                >
                  {expanded[kind] ? (
                    <ChevronDown size={13} />
                  ) : (
                    <ChevronRight size={13} />
                  )}
                </button>
                <Link
                  href={workspaceHref(kind)}
                  scroll={false}
                  className={`wb-folder ${view === kind && !selected ? "is-current" : ""}`}
                  onClick={() => setDirectory(false)}
                >
                  {expanded[kind] ? (
                    <FolderOpen size={16} />
                  ) : (
                    <Folder size={16} />
                  )}
                  <span>
                    {t(kind === "projects" ? "wb.projects" : "wb.writing")}
                  </span>
                  <small>
                    {kind === "projects" ? projects.length : writings.length}
                  </small>
                </Link>
              </div>
              {expanded[kind] && (
                <div className="wb-tree-children" id={`tree-${kind}`}>
                  {(kind === "projects" ? projects : writings).map((doc) =>
                    fileLink(doc, true),
                  )}
                </div>
              )}
            </div>
          ))}
          <Link href="/about" className="wb-folder wb-about-link">
            <CornerDownRight size={16} />
            <span>{t("wb.about")}</span>
            <ArrowUpRight size={13} />
          </Link>
          <div className="wb-sidebar-bottom">
            <p>{t("wb.sidebarNote")}</p>
            <a href="/rss.xml">
              <Rss size={13} />
              {t("label.rss")}
            </a>
          </div>
        </aside>

        <section className="wb-stage" aria-label={t("wb.stage")}>
          <nav className="wb-tabs" aria-label={t("wb.recentTabs")}>
            <Link
              href="/"
              scroll={false}
              className={`wb-tab wb-overview-tab ${view === "overview" ? "active" : ""}`}
              aria-current={view === "overview" ? "page" : undefined}
            >
              <LayoutDashboard size={14} />
              {t("wb.overview")}
            </Link>
            {tabs.map((id) => {
              const doc = docs.find((item) => item.id === id);
              return (
                doc && (
                  <div
                    key={id}
                    className={`wb-tab ${selected?.id === id ? "active" : ""}`}
                  >
                    <Link
                      href={workspaceHref(
                        doc.type === "projects" ? "projects" : "writing",
                        id,
                      )}
                      scroll={false}
                      aria-current={selected?.id === id ? "page" : undefined}
                    >
                      <FileText size={13} />
                      <span>{doc.title}</span>
                    </Link>
                    <button
                      type="button"
                      aria-label={`${t("wb.closeTab")} ${doc.title}`}
                      onClick={() => closeTab(id)}
                    >
                      <X size={13} />
                    </button>
                  </div>
                )
              );
            })}
            <button
              className="wb-tab-search"
              type="button"
              onClick={openSearch}
              aria-label={t("action.search")}
            >
              <Search size={16} />
            </button>
          </nav>
          <div
            ref={stageRef}
            tabIndex={-1}
            className="wb-stage-content"
            key={currentKey}
          >
            <div className="wb-breadcrumb">
              <span>evergreen</span>
              <ChevronRight size={12} />
              <span>{viewTitle}</span>
              {selected && (
                <>
                  <ChevronRight size={12} />
                  <span>{selected.slug}.mdx</span>
                </>
              )}
            </div>
            {view === "overview" && (
              <>
                <header className="wb-intro">
                  <p className="eyebrow">
                    <span className="wb-intro-dot" />
                    {t("wb.introEyebrow")}
                  </p>
                  <h1>
                    {t("wb.hello")}{" "}
                    <span>
                      {site.author}
                      <span className="text-accent">.</span>
                    </span>
                  </h1>
                  <p className="wb-intro-direction">
                    {lang === "en" ? site.directionEn : site.direction}
                  </p>
                  <p className="wb-introduction" lang="zh-CN">
                    {site.introduction}
                  </p>
                  <div className="wb-intro-links">
                    <a href={`mailto:${site.email}`}>
                      {t("home.mail")}
                      <ArrowUpRight size={15} />
                    </a>
                    <Link href="/about">
                      {t("home.about")}
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </header>
                <section className="wb-section">
                  {sectionHeading(
                    "wb.startHere",
                    "01",
                    workspaceHref("writing"),
                  )}
                  <div className="wb-entry-list">
                    {highlights.map((doc) => fileLink(doc))}
                  </div>
                </section>
                <section className="wb-section">
                  {sectionHeading("home.evidence", "02")}
                  <div className="wb-evidence">
                    {evidence.map((group) => (
                      <div key={group.key} className="wb-evidence-group">
                        <h3>{t(`evidence.${group.key}` as DictKey)}</h3>
                        {group.refs.map((ref) => {
                          const doc = docs.find((item) => item.id === ref);
                          return (
                            doc && (
                              <Link
                                href={workspaceHref(
                                  doc.type === "projects"
                                    ? "projects"
                                    : "writing",
                                  ref,
                                )}
                                scroll={false}
                                key={ref}
                              >
                                {doc.title}
                                <ArrowUpRight size={13} />
                              </Link>
                            )
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
            {selected ? (
              <>
                <header className="wb-intro wb-document-header">
                  <p className="eyebrow">
                    <FileText size={13} />
                    {t(
                      selected.type === "projects"
                        ? "wb.projectPreview"
                        : "wb.articlePreview",
                    )}
                  </p>
                  <h1 lang={selected.language}>{selected.title}</h1>
                  <div className="wb-entry-meta">
                    <time dateTime={selected.date}>
                      {formatDate(selected.date, lang)}
                    </time>
                    <span>
                      {selected.readingTime} {t("label.minRead")}
                    </span>
                    <span>
                      {selected.language === "zh-CN"
                        ? t("label.contentLanguage")
                        : selected.language}
                    </span>
                  </div>
                  <p className="wb-document-summary" lang={selected.language}>
                    {selected.summary}
                  </p>
                  <Link href={hrefOf(selected)} className="button-primary">
                    {t(
                      selected.type === "projects"
                        ? "wb.readProject"
                        : "wb.readArticle",
                    )}
                    <ArrowUpRight size={16} />
                  </Link>
                </header>
                {selected.type === "projects" && (
                  <section className="wb-section">
                    {sectionHeading("wb.projectContext", "01")}
                    <dl className="wb-project-facts">
                      {[
                        ["projects.role", selected.role],
                        ["projects.period", selected.period],
                        ["projects.contribution", selected.contribution],
                        ["projects.outcome", selected.outcome],
                      ].map(
                        ([label, value]) =>
                          value && (
                            <div key={label}>
                              <dt>{t(label as DictKey)}</dt>
                              <dd>{value}</dd>
                            </div>
                          ),
                      )}
                    </dl>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selected.stack.map((item) => (
                        <span className="tech-label" key={item}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
                {selected.headings.length > 0 && (
                  <section className="wb-section">
                    {sectionHeading(
                      "wb.inside",
                      selected.type === "projects" ? "02" : "01",
                    )}
                    <div className="wb-outline">
                      {selected.headings.map((heading, index) => (
                        <Link
                          href={`${hrefOf(selected)}#${heading.id}`}
                          key={heading.id}
                          className={`wb-entry wb-outline-entry depth-${heading.depth}`}
                        >
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <h3 lang={selected.language}>{heading.text}</h3>
                          <ArrowUpRight size={14} />
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
                <section className="wb-section">
                  {related.length > 0 && sectionHeading("wb.continue", "03")}
                  <div className="wb-entry-list">
                    {related.map((doc) => fileLink(doc))}
                  </div>
                  <Link
                    href={workspaceHref(view)}
                    scroll={false}
                    className="text-link mt-4"
                  >
                    ← {t("wb.backToList")}
                  </Link>
                </section>
              </>
            ) : (
              view !== "overview" && (
                <>
                  <header className="wb-intro wb-list-intro">
                    <p className="eyebrow">
                      {view === "projects"
                        ? "PROJECT ARCHIVE"
                        : "WRITING & NOTES"}
                    </p>
                    <h1>
                      {viewTitle}
                      <span className="wb-total">{scope.length}</span>
                    </h1>
                    <p className="wb-introduction">
                      {t(view === "projects" ? "projects.desc" : "blog.desc")}
                    </p>
                  </header>
                  {tag && (
                    <div className="wb-selected-filter">
                      <Hash size={14} />
                      {tag}
                      <Link
                        href={workspaceHref(view)}
                        scroll={false}
                        aria-label={t("action.clearFilter")}
                      >
                        <X size={16} />
                      </Link>
                    </div>
                  )}
                  <div className="wb-entry-list">
                    {filtered.map((doc) => fileLink(doc))}
                  </div>
                  {!filtered.length && (
                    <p className="wb-no-results">{t("blog.empty")}</p>
                  )}
                  <Link
                    href={view === "projects" ? "/projects" : "/blog"}
                    className="text-link mt-5"
                  >
                    {t("wb.openCollection")}
                    <ArrowUpRight size={15} />
                  </Link>
                </>
              )
            )}
            <div className="wb-stage-end">
              <span>— {site.author}</span>
              <span>{t("footer.note")}</span>
            </div>
          </div>
        </section>

        <aside className="wb-context" aria-label={t("wb.context")}>
          <section className="wb-side-panel">
            <p className="wb-panel-label">
              <BookOpen size={14} />
              {selected ? t("wb.currentFile") : t("wb.latest")}
            </p>
            {selected ? (
              <>
                <h2 lang={selected.language}>{selected.title}</h2>
                <p className="wb-context-description">{t("wb.previewNote")}</p>
                <Link href={hrefOf(selected)} className="text-link">
                  {t("wb.openOriginal")}
                  <ArrowUpRight size={14} />
                </Link>
              </>
            ) : (
              writings.slice(0, 3).map((doc) => (
                <Link
                  key={doc.id}
                  href={workspaceHref("writing", doc.id)}
                  scroll={false}
                  className="wb-latest-item"
                >
                  <time dateTime={doc.date}>
                    {doc.date.slice(5).replace("-", " / ")}
                  </time>
                  <span lang={doc.language}>{doc.title}</span>
                  <ArrowUpRight size={12} />
                </Link>
              ))
            )}
          </section>
          <section className="wb-side-panel">
            <p className="wb-panel-label">
              <Hash size={14} />
              {t("wb.topics")}
            </p>
            <div className="wb-topic-list">
              {topics.map(([label, count]) => (
                <Link
                  href={workspaceHref("writing", undefined, label)}
                  scroll={false}
                  key={label}
                  className={tag === label ? "active" : ""}
                >
                  {label}
                  <span>{count}</span>
                </Link>
              ))}
            </div>
          </section>
          <section className="wb-side-panel wb-contact-panel">
            <p className="wb-panel-label">
              <Mail size={14} />
              {t("about.contact")}
            </p>
            <h2>{t("wb.contactTitle")}</h2>
            <p className="wb-context-description">
              {t("wb.contactDescription")}
            </p>
            <a href={`mailto:${site.email}`} className="wb-contact-email">
              {site.email}
              <ArrowUpRight size={13} />
            </a>
            {site.resume && (
              <a href={site.resume} download className="text-link">
                {t("about.resume")}
                <ArrowUpRight size={13} />
              </a>
            )}
          </section>
        </aside>
      </div>
      <div className="wb-statusbar">
        <span>
          <span className="wb-intro-dot" />
          {t("wb.status")}
        </span>
        <span>
          {writings.length} {t("wb.writingCount")}
          <i>/</i>
          {projects.length} {t("wb.projectCount")}
        </span>
        <span>MDX / NEXT.JS</span>
      </div>
    </div>
  );
}
