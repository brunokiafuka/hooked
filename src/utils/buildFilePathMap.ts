import type { Report, Dependency } from "../types";

/**
 * Builds a map of import values to their corresponding file paths from the hooks dependency graph
 * @param hooks Map containing the dependency reports for each entry point
 * @returns A Map where keys are import values and values are file paths
 */
export function buildFilePathMap(
  hooks: Map<string, Report>
): Map<string, string> {
  const filePathMap = new Map<string, string>();

  const storeDependencyPaths = (deps: Dependency[]) => {
    for (const dep of deps) {
      filePathMap.set(dep.importValue, dep.filePath);
      if (dep.dependencies) {
        storeDependencyPaths(dep.dependencies);
      }
    }
  };

  for (const [key, report] of hooks) {
    filePathMap.set(report.entry, report.filePath);
    if (report.dependencies) {
      storeDependencyPaths(report.dependencies);
    }
  }

  return filePathMap;
}
