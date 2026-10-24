import { getAllDocs, getDoc, getEvidence } from "@/lib/content";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/metadata";
import { Workbench } from "@/components/Workbench";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "AI 与全栈开发 · 个人工作台",
  site.description,
  "/",
);
export default function HomePage() {
  const docs = getAllDocs().map((doc) => ({
    ...doc,
    id: doc.type + "/" + doc.slug,
    headings: getDoc(doc.type, doc.slug)?.toc || [],
  }));
  const evidence = getEvidence().map((group) => ({
    key: group.key,
    refs: group.docs.map((doc) => doc.type + "/" + doc.slug),
  }));
  return <Workbench docs={docs} evidence={evidence} />;
}
