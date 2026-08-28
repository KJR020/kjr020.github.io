#!/usr/bin/env tsx

import { readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { generateOgImage } from "../src/lib/ogImage";
import { preparePublicBuild } from "../src/lib/publicBuildInputs";

const publicInputDirs = ["src/pages", "public"];
const outputDir = "dist";
const projectRoot = process.cwd();

function listFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const filePath = path.join(directory, entry);
    const stats = statSync(filePath);
    return stats.isDirectory() ? listFiles(filePath) : [filePath];
  });
}

const forbiddenFiles = preparePublicBuild({
  publicInputDirs,
  outputDir,
  listFiles,
  removeOutputDir: (directory) => {
    rmSync(directory, { recursive: true, force: true });
  },
});

if (forbiddenFiles.length > 0) {
  console.error("Public build input check failed. Move these files outside public build inputs:");
  for (const filePath of forbiddenFiles) {
    console.error(`- ${filePath}`);
  }
  process.exit(1);
}

await generateOgImage({
  photoPath: path.join(projectRoot, "src", "assets", "og", "kuri-cutout.png"),
  sansBoldFontPath: path.join(projectRoot, "src", "assets", "og", "NotoSansJP-Bold.otf"),
  outputPath: path.join(projectRoot, "public", "og-image.png"),
});
