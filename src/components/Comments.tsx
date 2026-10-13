"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Send } from "lucide-react";
import type { Comment } from "@/lib/comments";
import { GlassCard } from "./GlassCard";

const NICK_KEY = "comment:nickname";
const MAIL_KEY = "comment:email";
const MAX_CONTENT = 1000;

function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="grid h-9 w-9 shrink-0 place-items-center rounded-pill bg-accent-soft text-sm font-medium text-accent"
    >
      {name.slice(0, 1)}
    </span>
  );
}

function timeText(createdAt: string): string {
  // 数据库返回 "YYYY-MM-DD HH:mm:ss"（UTC），补上时区标记再解析
  const d = new Date(createdAt.replace(" ", "T") + "Z");
  return Number.isNaN(d.getTime())
    ? createdAt.slice(0, 10)
    : d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}

export function Comments({ slug }: { slug: string }) {
  const [items, setItems] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [degraded, setDegraded] = useState(false);
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const refresh = async () => {
    try {
      const r = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`);
      const d = await r.json();
      setItems(d.items ?? []);
      setDegraded(Boolean(d.degraded));
    } catch {
      setDegraded(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setNickname(localStorage.getItem(NICK_KEY) ?? "");
    setEmail(localStorage.getItem(MAIL_KEY) ?? "");
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const { top, repliesOf } = useMemo(() => {
    const top = items.filter((c) => c.parentId === null);
    const map = new Map<number, Comment[]>();
    for (const c of items) {
      if (c.parentId === null) continue;
      if (!map.has(c.parentId)) map.set(c.parentId, []);
      map.get(c.parentId)!.push(c);
    }
    return { top, repliesOf: map };
  }, [items]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nickname.trim()) return setError("请填写昵称");
    if (!content.trim()) return setError("请填写评论内容");
    setBusy(true);
    try {
      const r = await fetch("/api/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug,
          nickname: nickname.trim(),
          email: email.trim(),
          content: content.trim(),
          parentId: replyTo,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "提交失败");
      localStorage.setItem(NICK_KEY, nickname.trim());
      if (email.trim()) localStorage.setItem(MAIL_KEY, email.trim());
      setContent("");
      setReplyTo(null);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-label="评论" className="mt-16">
      <h2 className="mb-4 text-lg font-semibold">
        评论
        {items.length > 0 && (
          <span className="ml-2 text-sm font-normal text-text-muted">{items.length}</span>
        )}
      </h2>

      <GlassCard className="p-5">
        {loading ? (
          <div className="space-y-3" aria-hidden>
            <div className="h-4 w-1/3 animate-pulse rounded bg-surface-strong" />
            <div className="h-20 animate-pulse rounded bg-surface-strong" />
          </div>
        ) : (
          <>
            {top.length === 0 && (
              <p className="mb-5 text-sm text-text-muted">
                {degraded ? "评论服务暂不可用，可发邮件直接联系我。" : "还没有评论，来说两句吧。"}
              </p>
            )}

            {top.length > 0 && (
              <ul className="mb-6 space-y-5">
                {top.map((c) => (
                  <li key={c.id}>
                    <div className="flex gap-3">
                      <Avatar name={c.nickname} />
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-baseline gap-2 text-sm">
                          <span className="font-medium">{c.nickname}</span>
                          <time className="text-xs text-text-muted">{timeText(c.createdAt)}</time>
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                          {c.content}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyTo(c.id);
                            setSubmitted(false);
                          }}
                          className="mt-1 text-xs text-text-muted hover:text-accent"
                        >
                          回复
                        </button>

                        {(repliesOf.get(c.id) ?? []).length > 0 && (
                          <ul className="mt-3 space-y-3 border-l border-border pl-3">
                            {(repliesOf.get(c.id) ?? []).map((r) => (
                              <li key={r.id} className="flex gap-2">
                                <Avatar name={r.nickname} />
                                <div className="min-w-0 flex-1">
                                  <p className="flex flex-wrap items-baseline gap-2 text-sm">
                                    <span className="font-medium">{r.nickname}</span>
                                    <time className="text-xs text-text-muted">
                                      {timeText(r.createdAt)}
                                    </time>
                                  </p>
                                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                                    {r.content}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={submit} className="space-y-3">
              {replyTo !== null && (
                <p className="flex items-center gap-2 text-xs text-text-muted">
                  正在回复 #{replyTo}
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="text-accent hover:underline"
                  >
                    取消
                  </button>
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="昵称"
                  maxLength={24}
                  className="w-40 rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="邮箱（选填，不公开）"
                  maxLength={120}
                  className="w-56 rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none"
                />
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                maxLength={MAX_CONTENT}
                placeholder="写下你的想法…"
                className="w-full resize-y rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none"
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-control bg-accent px-4 py-2 text-sm text-white disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <Send className="h-4 w-4" strokeWidth={1.5} />
                  )}
                  发表评论
                </button>
                <span className="text-xs text-text-muted">
                  {content.length}/{MAX_CONTENT}
                </span>
              </div>
              {submitted && (
                <p className="text-sm text-accent">评论已提交，通过审核后会显示在这里。</p>
              )}
              {error && <p className="text-sm text-red-500">{error}</p>}
            </form>
          </>
        )}
      </GlassCard>
    </section>
  );
}
