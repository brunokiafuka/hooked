import fs from "fs";
import path from "path";

import chalk from "chalk";
import * as recast from "recast";

import { DEFAULT_ACCEPTED_HOOKS } from "../config/constants";
import { assertHookPath } from "../utils/assertHookPath";
import { Report } from "../types";

import * as vscode from "vscode";

const parser = require("recast/parsers/babel-ts");

const ROOT_DIR = vscode?.workspace?.workspaceFolders?.[0].uri.fsPath ?? "";

/**
 * Visits import declarations in a file to analyze custom React hook dependencies
 * @param filePath Path to the file to analyze
 * @param analyzedFiles Set of files that have already been analyzed to prevent cycles
 * @param depth Current depth in the dependency tree
 * @returns Report object containing hook dependencies, or null if already analyzed
 */
export function visitImports(
  filePath: string,
  analyzedFiles = new Set<string>(),
  depth = 0
) {
  if (analyzedFiles.has(filePath)) {
    return null;
  }

  analyzedFiles.add(filePath);

  const code = fs.readFileSync(filePath, "utf8");

  let ast;
  try {
    ast = recast.parse(code, {
      parser,
    });
  } catch (error) {
    throw new Error(`Error parsing file: ${filePath}, error: ${error}`);
  }
  const callee = path.basename(filePath);

  const customHooks: Report = {
    depth,
    entry: callee,
    dependencies: [],
  };
  recast.visit(ast, {
    visitImportDeclaration(nodePath: any) {
      const importPath = nodePath.node.source.value as string;

      const importValues = (nodePath?.node?.specifiers ?? []).map(
        (specifier: any) => specifier?.local?.name
      ) as string[];

      for (const importValue of importValues) {
        const isCustomHook =
          !DEFAULT_ACCEPTED_HOOKS.includes(importValue) &&
          importValue.startsWith("use");

        if (!isCustomHook) {
          continue;
        }

        customHooks.dependencies.push({ importPath, importValue, callee });
      }

      this.traverse(nodePath);
    },
  });

  customHooks.dependencies.forEach((dependency, index) => {
    const isRelative =
      dependency.importPath.startsWith("./") ||
      dependency.importPath.startsWith("../");
    let hookPath = "";

    if (isRelative) {
      hookPath = assertHookPath(path.resolve(filePath, dependency.importPath));
    } else {
      hookPath = assertHookPath(
        // It would be better if we could get a configuration to indicate the path
        // of the file that contains apps implementation code
        // currently, we are assuming that the implementation lives in the `src` directory
        path.resolve(`${ROOT_DIR}/src/${dependency.importPath}`)
      );
    }

    try {
      const hookImports = visitImports(hookPath, analyzedFiles, depth + 1);

      customHooks.dependencies[index] = {
        ...dependency,
        depth: hookImports?.depth ?? 0,
        dependencies: hookImports?.dependencies ?? [],
      };
    } catch (error) {
      const errorMessage = chalk.red(
        `error: ${error}, hook: ${dependency.importValue}, filePath: ${filePath}`
      );
      process.stderr.write(errorMessage + "\n");
    }
  });

  return customHooks;
}
