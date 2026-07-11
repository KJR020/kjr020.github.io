#!/usr/bin/env tsx

import { readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { preparePublicBuild } from "../src/lib/publicBuildInputs";

const publicInputDirs = ["src/pages", "public"];
const outputDir = "dist";

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
