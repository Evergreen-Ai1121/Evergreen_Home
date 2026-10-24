import fs from "node:fs";
import path from "node:path";
import { loadTs } from "./load-ts.mjs";
const { validateReferences, getAllDocs } = await loadTs("src/lib/content.ts");
const { site } = await loadTs("src/lib/site.ts");
validateReferences();
if (site.resume) {
  const root = path.resolve("public");
  const target = path.resolve(root, site.resume.replace(/^\//, ""));
  if (
    !target.startsWith(root + path.sep) ||
    !target.endsWith(".pdf") ||
    !fs.existsSync(target)
  )
    throw new Error("Resume must point to an existing local PDF in public/");
}
console.log(
  `Content references validated: ${getAllDocs().filter((d) => !d.draft).length} published documents`,
);
