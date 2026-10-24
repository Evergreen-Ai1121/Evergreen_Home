import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import ts from "typescript";
const require = createRequire(import.meta.url);
const cache = new Map();
/** Compile local data modules in memory so scripts and tests exercise the real readers. */
function moduleUrl(filename) {
  const absolute = path.resolve(filename);
  if (cache.has(absolute)) return cache.get(absolute);
  const source = fs.readFileSync(absolute, "utf8");
  let output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  output = output.replace(/from\s+["']([^"']+)["']/g, (full, name) => {
    if (name.startsWith("node:")) return full;
    const target = name.startsWith(".")
      ? moduleUrl(path.resolve(path.dirname(absolute), `${name}.ts`))
      : pathToFileURL(require.resolve(name)).href;
    return `from ${JSON.stringify(target)}`;
  });
  const url = `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`;
  cache.set(absolute, url);
  return url;
}
export function loadTs(filename) {
  return import(moduleUrl(filename));
}
