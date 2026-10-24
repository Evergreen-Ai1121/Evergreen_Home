import assert from "node:assert/strict";
const base = process.argv[2] || "http://127.0.0.1:3100";
const pages = [
  "/",
  "/blog",
  "/projects",
  "/about",
  "/notes/c-language",
  "/notes/computer-networks",
  "/projects/personal-website",
  "/tags",
  "/tags/C%2FC%2B%2B",
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
  "/posts/debug-image-cls",
  "/posts/why-i-built-this-site",
  "/notes/react-server-components",
  "/notes/big-o-cheatsheet",
  "/notes/glassmorphism-performance",
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
    `${base}/${type}?tag=C%2FC%2B%2B&category=${encodeURIComponent("前端")}&page=2`,
    { redirect: "manual" },
  );
  assert.equal(response.status, 308);
  const target = new URL(response.headers.get("location"), base);
  assert.equal(target.pathname, "/blog");
  assert.equal(target.searchParams.get("type"), type);
  assert.equal(target.searchParams.get("tag"), "C/C++");
  assert.equal(target.searchParams.get("category"), "前端");
  assert.equal(target.searchParams.get("page"), "2");
}
const filtered = await (
  await fetch(base + "/blog?type=notes&tag=C%2FC%2B%2B")
).text();
assert.equal((filtered.match(/class="writing-row /g) || []).length, 1);
assert.ok(filtered.includes("C语言"));
const workspace = await (
  await fetch(base + "/?view=writing&doc=notes%2Fc-language")
).text();
assert.ok(workspace.includes("C语言"));
assert.ok(workspace.includes('href="/notes/c-language"'));
const topic = await (
  await fetch(base + "/?view=writing&tag=C%2FC%2B%2B")
).text();
assert.equal((topic.match(/class="wb-entry /g) || []).length, 1);
const networkWorkspace = await (
  await fetch(base + "/?view=writing&doc=notes%2Fcomputer-networks")
).text();
assert.ok(networkWorkspace.includes('href="/notes/computer-networks"'));
const networkBlog = await (
  await fetch(base + "/blog?type=notes&tag=" + encodeURIComponent("计算机网络"))
).text();
assert.equal((networkBlog.match(/class="writing-row /g) || []).length, 1);
assert.ok(networkBlog.includes("计算机网络"));
for (const tag of ["计算机网络", "TCP/IP", "网络协议"]) {
  assert.equal(
    (await fetch(base + "/tags/" + encodeURIComponent(tag))).status,
    200,
  );
}
const searchIndex = await (await fetch(base + "/search-index.json")).json();
const networkSearch = searchIndex.find(
  (item) => item.url === "/notes/computer-networks",
);
assert.ok(networkSearch?.body.includes("IPSec"));
assert.ok(networkSearch.body.length > 3000);
assert.deepEqual(
  searchIndex
    .filter((item) => item.type === "notes")
    .map((item) => item.url)
    .sort(),
  ["/notes/c-language", "/notes/computer-networks"],
);
const networkHtml = await (
  await fetch(base + "/notes/computer-networks")
).text();
const networkImages = [
  ...new Set(
    [
      ...networkHtml.matchAll(/src="(\/images\/computer-networks\/[^"?]+)"/g),
    ].map((match) => match[1]),
  ),
];
assert.equal(networkImages.length, 18);
for (const image of [
  ...networkImages,
  "/images/c-language/compilation-pipeline.png",
]) {
  const response = await fetch(base + image);
  assert.equal(response.status, 200);
  assert.ok(response.headers.get("content-type").startsWith("image/"));
}
const sitemap = await (await fetch(base + "/sitemap.xml")).text();
assert.ok(!sitemap.includes("/moments") && !sitemap.includes("/admin"));
assert.ok(sitemap.includes("/blog"));
assert.ok(sitemap.includes("/notes/computer-networks"));
const rss = await (await fetch(base + "/rss.xml")).text();
assert.ok(rss.includes("/notes/computer-networks"));
assert.ok(!rss.includes("/notes/react-server-components"));
assert.equal((await fetch(base + "/rss.xml")).status, 200);
const image = await fetch(base + "/opengraph-image");
assert.equal(image.status, 200);
assert.ok(image.headers.get("content-type").includes("image/png"));
console.log(
  `HTTP smoke passed: ${pages.length} indexed pages, 11 removed or retired endpoints, redirects, filters, sitemap, RSS and sharing image`,
);
