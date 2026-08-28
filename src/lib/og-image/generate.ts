import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { createOgImagePng, type OgImageSourceOptions } from "./template";

export type GenerateOgImageOptions = OgImageSourceOptions & {
  outputPath: string;
};

export async function generateOgImage({
  outputPath,
  ...sourceOptions
}: GenerateOgImageOptions): Promise<void> {
  const png = await createOgImagePng(sourceOptions);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, png);
}
