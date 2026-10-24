import Link from "next/link";
import type { DocMeta } from "@/lib/content";
import { cn } from "@/lib/utils";
import { T } from "./LangProvider";
import { WritingRow, ProjectExhibit } from "./Exhibit";
export function TagChip({ name, href }: { name: string; href?: string }) {
  return href ? (
    <Link href={href} className="filter-chip active">
      {name}
    </Link>
  ) : (
    <span className="tech-label">{name}</span>
  );
}
export function BadgeChip({ badge }: { badge?: string }) {
  return badge ? (
    <span className={cn("tech-label")}>
      {badge === "Pin" ? <T k="blog.featured" /> : badge}
    </span>
  ) : null;
}
export function ContentCard({ doc }: { doc: DocMeta }) {
  return <WritingRow doc={doc} />;
}
export function NoteItem({ doc }: { doc: DocMeta }) {
  return <WritingRow doc={doc} />;
}
export function ProjectCard({ doc }: { doc: DocMeta }) {
  return <ProjectExhibit doc={doc} />;
}
