import { DEPTH_COLORS } from "../config/constants";
import { Dependency, Report } from "../types";

/**
 * Generates a Mermaid diagram representation of the dependency graph
 * @param result Map containing the dependency reports for each entry point
 * @returns A string containing the Mermaid diagram code
 */

export function generateMermaidDiagram(result: Map<string, Report>) {
  let mermaidCode = "graph TD\n";

  for (const [key, value] of result) {
    mermaidCode += `  ${key}["${value.entry}"]\n`;
    mermaidCode += `  style ${key} fill:${DEPTH_COLORS[0]}\n`;

    mermaidCode += addDependenciesToMermaid(value, key, 1);
  }

  return mermaidCode;
}

/**
 * Recursively adds dependencies to the Mermaid diagram code
 * @param node The dependency or report node to process
 * @param parentKey The key of the parent node in the diagram
 * @param depth The current depth level in the dependency tree
 * @returns A string containing the Mermaid code for the dependencies
 */
function addDependenciesToMermaid(
  node: Dependency | Report,
  parentKey: string,
  depth = 0
) {
  let newMermaidCode = "";

  for (const dep of node.dependencies ?? []) {
    const depKey = dep.importValue.replace(/[^a-zA-Z0-9]/g, "_");
    newMermaidCode += `  ${parentKey} --> ${depKey}\n`;
    newMermaidCode += `  ${depKey}["${dep.importValue}"]\n`;
    // @ts-ignore
    newMermaidCode += `  style ${depKey} fill:${DEPTH_COLORS[depth]}\n`;

    if (Array.isArray(dep.dependencies)) {
      newMermaidCode += addDependenciesToMermaid(dep, depKey, depth + 1);
    }
  }

  return newMermaidCode;
}
