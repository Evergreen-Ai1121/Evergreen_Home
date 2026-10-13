import Link from "next/link";
import { SearchTrigger } from "@/components/SearchTrigger";
import { GlassCard } from "@/components/GlassCard";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-reading flex-col justify-center py-16">
      <h1 className="text-3xl font-semibold">页面走丢了</h1>
      <p className="mt-3 text-text-muted">
        没有找到这个地址对应的内容。可以回首页，或者搜一下你想看的东西。
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href="/"
          className="rounded-control border border-border bg-surface px-4 py-2 text-sm hover:bg-surface-strong"
        >
          回到首页
        </Link>
        <SearchTrigger withHint />
      </div>
      <GlassCard className="mt-10 p-5 text-sm text-text-muted">
        如果你是从站外链接进来的，可能是内容被我改名或删掉了。
      </GlassCard>
    </div>
  );
}
