import path from "node:path";

const forbiddenPageFileNames = new Set(["CLAUDE.md"]);
const publicBuildInputDirs = ["src/pages", "public"];

type PreparePublicBuildOptions = {
  publicInputDirs: string[];
  outputDir: string;
  listFiles: (directory: string) => string[];
  removeOutputDir: (directory: string) => void;
};

function toPosixPath(filePath: string) {
  return filePath.split(path.sep).join("/");
}

export function findForbiddenPublicPageFiles(filePaths: string[]) {
  return filePaths
    .map(toPosixPath)
    .filter((filePath) => {
      const isPublicBuildInput = publicBuildInputDirs.some(
        (directory) => filePath === directory || filePath.startsWith(`${directory}/`),
      );
      return isPublicBuildInput && forbiddenPageFileNames.has(path.posix.basename(filePath));
    })
    .sort();
}

export function preparePublicBuild({
  publicInputDirs,
  outputDir,
  listFiles,
  removeOutputDir,
}: PreparePublicBuildOptions) {
  removeOutputDir(outputDir);
  const publicInputFiles = publicInputDirs.flatMap(listFiles);
  return findForbiddenPublicPageFiles(publicInputFiles);
}
