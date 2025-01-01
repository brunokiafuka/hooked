import fs from "fs";
import path from "path";

import { NON_SCREEN_DIRS } from "./config/constants";
import { visitImports } from "./impl/visitImports";

const log = console.log;

export function analyze(dirPath: string) {
  const filesAnalyzed = new Map();

  if (fs.lstatSync(dirPath).isFile()) {
    const result = visitImports(dirPath);

    filesAnalyzed.set(path.basename(dirPath), result);
    return filesAnalyzed;
  }

  fs.readdirSync(dirPath).forEach((file) => {
    const fullPath = path.resolve(dirPath, file);
    const fileName = path.basename(fullPath);

    if (
      fs.lstatSync(fullPath).isDirectory() &&
      !NON_SCREEN_DIRS.includes(file)
    ) {
      analyze(fullPath);
    } else if (file.endsWith(".tsx") && !file.includes(".test.tsx")) {
      const result = visitImports(fullPath);

      filesAnalyzed.set(fileName, result);
    }
  });

  return filesAnalyzed;
}
