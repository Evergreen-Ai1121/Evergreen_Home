import { permanentRedirect } from "next/navigation";
import { blogHref } from "@/lib/content-rules";
export default async function LegacyList({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; category?: string; page?: string }>;
}) {
  const query = await searchParams;
  permanentRedirect(
    blogHref({
      ...query,
      type: "posts",
      page: query.page ? Number(query.page) : undefined,
    }),
  );
}
