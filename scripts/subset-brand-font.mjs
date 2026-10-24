import fs from "node:fs";
import subsetFont from "subset-font";
const source = fs.readFileSync("assets/fonts/SmileySans-Oblique.otf");
const subset = await subsetFont(source, "Evergreen.", {
  targetFormat: "woff2",
});
fs.writeFileSync("public/fonts/SmileySans-Brand.woff2", subset);
console.log(`Brand font generated: ${subset.length} bytes`);
