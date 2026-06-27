import path from "node:path";

const forbiddenPageFileNames = new Set(["CLAUDE.md"]);
const publicBuildInputDirs = ["src/pages", "public"];

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
