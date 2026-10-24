import { getAllSlugs, getDoc } from "@/lib/content";
import { ArticlePage } from "@/components/ArticlePage";
import { pageMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
export function generateStaticParams() {
  return getAllSlugs("notes").map((slug) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDoc("notes", slug);
  if (!doc) notFound();
  return pageMetadata(
    doc.title,
    doc.summary,
    "/notes/" + encodeURIComponent(slug),
    doc.cover,
  );
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ArticlePage type="notes" slug={slug} />;
}
