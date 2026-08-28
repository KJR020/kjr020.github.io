#!/usr/bin/env tsx

import path from "node:path";

import { generateOgImage } from "../src/lib/ogImage";

const projectRoot = process.cwd();

await generateOgImage({
  photoPath: path.join(projectRoot, "src", "assets", "og", "kuri-cutout.png"),
  sansBoldFontPath: path.join(projectRoot, "src", "assets", "og", "NotoSansJP-Bold.otf"),
  outputPath: path.join(projectRoot, "public", "og-image.png"),
});
