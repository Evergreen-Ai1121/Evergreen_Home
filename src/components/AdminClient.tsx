"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, LogOut, Trash2, Upload } from "lucide-react";
import type { Moment } from "@/lib/moments";
import { GlassCard } from "./GlassCard";
import { PageHeader } from "./PageHeader";

const MAX_IMAGES = 9;
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function AdminClient() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [list, setList] = useState<Moment[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

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
    if (authed) refresh();
  }, [authed]);

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

  const pickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    const rejected = picked.filter(
      (f) => !ALLOWED.includes(f.type) || f.size > MAX_BYTES,
    );
    if (rejected.length > 0) {
      setError("仅支持 jpg / png / webp / gif，且单张不超过 10MB");
    }
    setFiles((prev) => [...prev, ...picked.filter((f) => !rejected.includes(f))].slice(0, MAX_IMAGES));
    e.target.value = "";
  };

  const publish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!content.trim()) return setError("内容不能为空");
    setBusy(true);
    try {
      const images: { key: string; url: string; alt: string }[] = [];
      for (const f of files) {
        const credRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ contentType: f.type, size: f.size }),
        });
        if (!credRes.ok) throw new Error((await credRes.json()).error ?? "获取上传凭证失败");
        const cred = await credRes.json();
        const put = await fetch(cred.uploadUrl, {
          method: "PUT",
          headers: { "content-type": f.type },
          body: f,
        });
        if (!put.ok) throw new Error(`图片 ${f.name} 上传失败`);
        images.push({ key: cred.key, url: cred.url, alt: f.name });
      }
      const res = await fetch("/api/moments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: content.trim(), images }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "发布失败");
      setContent("");
      setFiles([]);
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
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1 rounded-control border border-border px-3 py-2 text-sm hover:bg-surface-strong"
            >
              <Upload className="h-4 w-4" strokeWidth={1.5} />
              选择图片（{files.length}/{MAX_IMAGES}）
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              hidden
              onChange={pickFiles}
            />
            <button
              type="submit"
              disabled={busy}
              className="ml-auto inline-flex items-center gap-2 rounded-control bg-accent px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />}
              发布
            </button>
          </div>
          {files.length > 0 && (
            <ul className="flex flex-wrap gap-2 text-xs text-text-muted">
              {files.map((f, i) => (
                <li key={i} className="flex items-center gap-1">
                  <span className="rounded-pill border border-border px-2 py-1">{f.name}</span>
                  <button
                    type="button"
                    aria-label={`移除 ${f.name}`}
                    onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </GlassCard>

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
