#!/usr/bin/env node
/**
 * Convert TOML frontmatter to YAML frontmatter
 * Usage: node scripts/convert-frontmatter.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from "fs";
import { join, relative } from "path";

const SOURCE_DIR = "content/posts";
const DEST_DIR = "src/content/posts";

function parseTOMLFrontmatter(content) {
  const match = content.match(/^\+\+\+\n([\s\S]*?)\n\+\+\+/);
  if (!match) return null;

  const tomlContent = match[1];
  const body = content.slice(match[0].length).trim();

  const frontmatter = {};

  // Parse TOML fields
  const lines = tomlContent.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Match key = value patterns
    const keyValueMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
    if (keyValueMatch) {
      const [, key, rawValue] = keyValueMatch;
      let value = rawValue.trim();

      // Parse value
      if (value.startsWith("'") && value.endsWith("'")) {
        // Single quoted string
        value = value.slice(1, -1);
      } else if (value.startsWith('"') && value.endsWith('"')) {
        // Double quoted string
        value = value.slice(1, -1);
      } else if (value.startsWith("[") && value.endsWith("]")) {
        // Array
        value = value
          .slice(1, -1)
          .split(",")
          .map((v) => v.trim().replace(/^['"]|['"]$/g, ""))
          .filter((v) => v);
      } else if (value === "true") {
        value = true;
      } else if (value === "false") {
        value = false;
      } else if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
        // Date - keep as is
        value = value;
      } else if (!isNaN(Number(value))) {
        value = Number(value);
      }

      frontmatter[key] = value;
    }
  }

  return { frontmatter, body };
}

function toYAMLFrontmatter(frontmatter) {
  const lines = ["---"];

  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else {
        lines.push(`${key}:`);
        for (const item of value) {
          lines.push(`  - "${item}"`);
        }
      }
    } else if (typeof value === "boolean") {
      lines.push(`${key}: ${value}`);
    } else if (typeof value === "string") {
      // Check if value needs quoting
      if (
        value.includes(":") ||
        value.includes("#") ||
        value.startsWith("'") ||
        value.startsWith('"')
      ) {
        lines.push(`${key}: "${value.replace(/"/g, '\\"')}"`);
      } else {
        lines.push(`${key}: "${value}"`);
      }
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  lines.push("---");
  return lines.join("\n");
}

function processFile(sourcePath, destPath) {
  const content = readFileSync(sourcePath, "utf-8");
  const parsed = parseTOMLFrontmatter(content);

  if (!parsed) {
    console.log(`⚠️  Skipping (no TOML frontmatter): ${sourcePath}`);
    return false;
  }

  const { frontmatter, body } = parsed;
  const yamlFrontmatter = toYAMLFrontmatter(frontmatter);
  const newContent = `${yamlFrontmatter}\n\n${body}\n`;

  // Create directory if needed
  const destDir = destPath.substring(0, destPath.lastIndexOf("/"));
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  writeFileSync(destPath, newContent, "utf-8");
  console.log(`✅ Converted: ${relative(".", sourcePath)} → ${relative(".", destPath)}`);
  return true;
}

function processDirectory(sourceDir, destDir) {
  const entries = readdirSync(sourceDir);
  let converted = 0;
  let skipped = 0;

  for (const entry of entries) {
    const sourcePath = join(sourceDir, entry);
    const destPath = join(destDir, entry);
    const stat = statSync(sourcePath);

    if (stat.isDirectory()) {
      const result = processDirectory(sourcePath, destPath);
      converted += result.converted;
      skipped += result.skipped;
    } else if (entry.endsWith(".md")) {
      if (processFile(sourcePath, destPath)) {
        converted++;
      } else {
        skipped++;
      }
    }
  }

  return { converted, skipped };
}

// Main
console.log("🔄 Converting TOML frontmatter to YAML...\n");

if (!existsSync(SOURCE_DIR)) {
  console.error(`❌ Source directory not found: ${SOURCE_DIR}`);
  process.exit(1);
}

const result = processDirectory(SOURCE_DIR, DEST_DIR);
console.log(`\n📊 Summary:`);
console.log(`   Converted: ${result.converted} files`);
console.log(`   Skipped: ${result.skipped} files`);
