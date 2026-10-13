"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, LogOut, Trash2 } from "lucide-react";
import type { Moment } from "@/lib/moments";
import type { Comment } from "@/lib/comments";
import { GlassCard } from "./GlassCard";
import { PageHeader } from "./PageHeader";

export function AdminClient() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [list, setList] = useState<Moment[]>([]);
  const [pending, setPending] = useState<Comment[]>([]);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.authed)))
      .catch(() => setAuthed(false));
  }, []);

  const refresh = async () => {
    const r = await fetch("/api/moments?limit=20");
    const d = await r.json();
    setList(d.items ?? []);
  };

  useEffect(() => {
    if (authed) {
      refresh();
      refreshPending();
    }
  }, [authed]);

  const refreshPending = async () => {
    const r = await fetch("/api/comments?status=pending");
    const d = await r.json().catch(() => ({}));
    setPending(d.items ?? []);
  };

  const moderate = async (id: number, status: "approved" | "spam") => {
    const r = await fetch(`/api/comments/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (r.ok) refreshPending();
    else setError((await r.json()).error ?? "操作失败");
  };

  const removeComment = async (id: number) => {
    if (!confirm("确定删除这条评论？")) return;
    const r = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (r.ok) refreshPending();
    else setError((await r.json()).error ?? "删除失败");
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const r = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (r.ok) {
      setPassword("");
      setAuthed(true);
    } else {
      const d = await r.json().catch(() => ({}));
      setError(d.error ?? "登录失败");
    }
  };

  const logout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthed(false);
    setList([]);
  };

  const publish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!content.trim()) return setError("内容不能为空");
    setBusy(true);
    try {
      const res = await fetch("/api/moments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: content.trim(), images: [] }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "发布失败");
      setContent("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "发布失败");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("确定删除这条说说？此操作不可撤销。")) return;
    const r = await fetch(`/api/moments/${id}`, { method: "DELETE" });
    if (r.ok) refresh();
    else setError((await r.json()).error ?? "删除失败");
  };

  if (authed === null) {
    return (
      <p className="flex items-center gap-2 text-sm text-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
        检查登录状态…
      </p>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-[420px]">
        <PageHeader title="管理端" description="输入管理员令牌以发布说说。" />
        <GlassCard className="p-5">
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="管理员令牌"
              className="w-full rounded-control border border-border bg-surface px-3 py-2 outline-none"
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-control bg-accent px-4 py-2 text-sm text-white"
            >
              登录
            </button>
          </form>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-reading">
      <div className="flex items-baseline justify-between">
        <PageHeader title="发一条说说" />
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          退出
        </button>
      </div>

      <GlassCard className="p-5">
        <form onSubmit={publish} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="此刻在想什么？"
            className="w-full resize-y rounded-control border border-border bg-surface px-3 py-2 outline-none"
          />
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs text-text-muted">
              配图请放 <code className="rounded bg-surface-strong px-1">public/images/</code>
              ，随代码一起发布（本站未启用运行时上传）。
            </p>
            <button
              type="submit"
              disabled={busy}
              className="ml-auto inline-flex items-center gap-2 rounded-control bg-accent px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />}
              发布
            </button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </GlassCard>

      {pending.length > 0 && (
        <>
          <h2 className="mb-3 mt-10 text-sm text-text-muted">
            待审核评论（{pending.length}）
          </h2>
          <div className="space-y-3">
            {pending.map((c) => (
              <GlassCard key={c.id} className="flex items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-text-muted">
                    {c.nickname} · {c.slug} · {c.createdAt}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{c.content}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moderate(c.id, "approved")}
                    aria-label="通过"
                    className="rounded-control p-2 text-text-muted hover:text-accent"
                  >
                    <Check className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moderate(c.id, "spam")}
                    aria-label="标记为垃圾"
                    className="rounded-control p-2 text-xs text-text-muted hover:text-text"
                  >
                    垃圾
                  </button>
                  <button
                    type="button"
                    onClick={() => removeComment(c.id)}
                    aria-label="删除这条评论"
                    className="rounded-control p-2 text-text-muted hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </>
      )}

      <h2 className="mb-3 mt-10 text-sm text-text-muted">最近 20 条</h2>
      <div className="space-y-3">
        {list.map((m) => (
          <GlassCard key={m.id} className="flex items-start gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="whitespace-pre-wrap text-sm">{m.content}</p>
              <p className="mt-1 text-xs text-text-muted">
                {m.createdAt} · {m.images.length} 张图
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(m.id)}
              aria-label="删除这条说说"
              className="rounded-control p-2 text-text-muted hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
