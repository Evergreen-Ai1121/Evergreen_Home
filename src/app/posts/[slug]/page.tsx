import { getAllSlugs, getDoc } from "@/lib/content";
import { ArticlePage } from "@/components/ArticlePage";
import { pageMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
export function generateStaticParams() {
  return getAllSlugs("posts").map((slug) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDoc("posts", slug);
  if (!doc) notFound();
  return pageMetadata(
    doc.title,
    doc.summary,
    "/posts/" + encodeURIComponent(slug),
    doc.cover,
  );
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ArticlePage type="posts" slug={slug} />;
}
