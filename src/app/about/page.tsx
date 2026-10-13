import { getPage } from "@/lib/content";
import { Mdx } from "@/components/Mdx";
import { EmptyState, PageHeader } from "@/components/PageHeader";

export const metadata = { title: "关于" };

export default function AboutPage() {
  const page = getPage("about");

  return (
    <div className="mx-auto max-w-reading">
      <PageHeader title="关于" />
      {page ? <Mdx source={page.content} /> : <EmptyState>关于页还没有内容。</EmptyState>}
    </div>
  );
}
