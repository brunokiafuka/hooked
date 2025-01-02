import fs from "fs";

/**
 * If the file path does not exist, check if the file path with .ts or .tsx extension exists.
 * @param filePath
 * @returns string
 */
export function assertHookPath(filePath: string) {
  let hookPath = `${filePath}`;

  if (fs.existsSync(hookPath)) {
    return hookPath;
  }

  if (fs.existsSync(`${hookPath}.ts`)) {
    hookPath += ".ts";
  } else if (fs.existsSync(`${hookPath}.tsx`)) {
    hookPath += ".tsx";
  } else if (fs.existsSync(`${hookPath}.jsx`)) {
    hookPath += ".jsx";
  } else if (fs.existsSync(`${hookPath}.js`)) {
    hookPath += ".js";
  }

  return hookPath;
}
