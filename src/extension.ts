import * as vscode from "vscode";
import { analyze } from "./core";
import { generateMermaidDiagram } from "./impl/genMermaid";
import { getWebviewContent } from "./utils/getWebviewContent";

// Todo: Improve the correctness of files traversal, its currently not dynamic

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("hooked.analyze", () => {
    const editor = vscode.window.activeTextEditor;

    const hooks = analyze(editor?.document.uri.path || "");
    const baseFileName = editor?.document.fileName.split("/").pop();

    if (!hooks) {
      vscode.window.showInformationMessage("No hooks found!");
      return;
    }

    const diagram = generateMermaidDiagram(hooks);

    vscode.env.clipboard.writeText(diagram).then(() => {
      vscode.window.showInformationMessage(
        `🪝 for ${baseFileName} copied to clipboard`
      );
    });

    // Create and show a new webview panel to display the diagram
    const panel = vscode.window.createWebviewPanel(
      "diagram",
      `Hooks diagram for ${baseFileName}`,
      vscode.ViewColumn.Beside,
      {}
    );

    panel.webview.options = {
      enableScripts: true,
    };
    panel.webview.html = getWebviewContent(diagram);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
