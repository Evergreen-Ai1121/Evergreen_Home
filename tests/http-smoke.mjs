import assert from "node:assert/strict";
const base = process.argv[2] || "http://127.0.0.1:3100";
const pages = [
  "/",
  "/blog",
  "/projects",
  "/about",
  "/posts/debug-image-cls",
  "/notes/react-server-components",
  "/projects/personal-website",
  "/tags",
  "/tags/React",
  "/archive",
];
for (const pathname of pages) {
  const response = await fetch(base + pathname);
  assert.equal(response.status, 200, pathname);
  const html = await response.text();
  assert.ok(!html.includes("Application error:"), pathname);
  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
  assert.ok(canonical, `Missing canonical: ${pathname}`);
  assert.equal(
    decodeURIComponent(new URL(canonical).pathname),
    decodeURIComponent(pathname),
  );
}
for (const pathname of [
  "/moments",
  "/admin",
  "/api/comments",
  "/api/moments",
  "/api/upload",
  "/api/admin/session",
]) {
  assert.equal((await fetch(base + pathname)).status, 404, pathname);
}
for (const type of ["posts", "notes"]) {
  const response = await fetch(
    `${base}/${type}?tag=React&category=${encodeURIComponent("前端")}&page=2`,
    { redirect: "manual" },
  );
  assert.equal(response.status, 308);
  const target = new URL(response.headers.get("location"), base);
  assert.equal(target.pathname, "/blog");
  assert.equal(target.searchParams.get("type"), type);
  assert.equal(target.searchParams.get("tag"), "React");
  assert.equal(target.searchParams.get("category"), "前端");
  assert.equal(target.searchParams.get("page"), "2");
}
const filtered = await (
  await fetch(base + "/blog?type=notes&tag=React")
).text();
assert.equal((filtered.match(/class="writing-row /g) || []).length, 1);
assert.ok(filtered.includes("理解 React Server Components"));
const workspace = await (
  await fetch(base + "/?view=writing&doc=notes%2Freact-server-components")
).text();
assert.ok(workspace.includes("理解 React Server Components"));
assert.ok(workspace.includes('href="/notes/react-server-components"'));
const topic = await (await fetch(base + "/?view=writing&tag=React")).text();
assert.equal((topic.match(/class="wb-entry /g) || []).length, 1);
const sitemap = await (await fetch(base + "/sitemap.xml")).text();
assert.ok(!sitemap.includes("/moments") && !sitemap.includes("/admin"));
assert.ok(sitemap.includes("/blog"));
assert.equal((await fetch(base + "/rss.xml")).status, 200);
const image = await fetch(base + "/opengraph-image");
assert.equal(image.status, 200);
assert.ok(image.headers.get("content-type").includes("image/png"));
console.log(
  `HTTP smoke passed: ${pages.length} indexed pages, 6 retired endpoints, redirects, filters, sitemap, RSS and sharing image`,
);
