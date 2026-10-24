import Link from "next/link";
import { T } from "@/components/LangProvider";
import { SearchTrigger } from "@/components/SearchTrigger";
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-reading flex-col justify-center py-16">
      <p className="eyebrow text-accent">404 / NOT FOUND</p>
      <h1 className="page-title mt-5">
        <T k="page.notFound" />
      </h1>
      <p className="mt-5 text-text-muted">
        <T k="page.notFoundDesc" />
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link href="/" className="button-primary">
          <T k="page.home" />
        </Link>
        <SearchTrigger withHint />
      </div>
    </div>
  );
}
