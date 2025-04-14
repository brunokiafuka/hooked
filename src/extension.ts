import * as vscode from "vscode";
import { analyze } from "./core";
import { generateMermaidDiagram } from "./impl/genMermaid";
import { getWebviewContent } from "./utils/getWebviewContent";
import { isSupportedFileExtension } from "./utils/isSupportedFileExtension";
import { SUPPORTED_EXTENSIONS } from "./config/constants";
import path from "path";
import { buildFilePathMap } from "./utils/buildFilePathMap";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("hooked.analyze", () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showInformationMessage("No active editor found.");
      return;
    }

    const baseFileName = editor?.document.fileName.split("/").pop();
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

    if (baseFileName === undefined || !workspaceRoot) {
      return;
    }

    if (!isSupportedFileExtension(baseFileName)) {
      const expectedExtensions = SUPPORTED_EXTENSIONS.join(", ");

      vscode.window.showInformationMessage(
        `This file type is not supported. Please open a file with one of these extensions: ${expectedExtensions}`
      );
      return;
    }

    const hooks = analyze(editor?.document.uri.path || "");

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

    const panel = vscode.window.createWebviewPanel(
      "diagram",
      `Hooks diagram for ${baseFileName}`,
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    const filePathMap = buildFilePathMap(hooks);

    panel.webview.html = getWebviewContent(diagram);
    panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case "nodeClick":
            const nodeId = message.nodeId;
            const filePath = filePathMap.get(nodeId);

            if (filePath) {
              try {
                let uri = vscode.Uri.file(filePath);

                if (
                  !(await vscode.workspace.fs.stat(uri).then(
                    () => true,
                    () => false
                  ))
                ) {
                  const relativePath = path.join(workspaceRoot, filePath);
                  uri = vscode.Uri.file(relativePath);
                }

                const doc = await vscode.workspace.openTextDocument(uri);
                await vscode.window.showTextDocument(doc);
                vscode.window.showInformationMessage(
                  `Opened ${path.basename(filePath)}`
                );
              } catch (error) {
                vscode.window.showErrorMessage(
                  `Could not open file: ${filePath}`
                );
              }
            } else {
              vscode.window.showInformationMessage(
                `Could not find file for: ${nodeId}, path: `
              );
            }
            break;
          case "screenshot":
            try {
              const screenshotData = message.data.split(",")[1];
              const buffer = Buffer.from(screenshotData, "base64");

              const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
              const fileName = `hooked-diagram-${timestamp}.png`;

              const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
              if (!workspaceFolder) {
                vscode.window.showErrorMessage(
                  "No workspace folder found to save screenshot"
                );
                return;
              }

              const filePath = path.join(workspaceFolder.uri.fsPath, fileName);

              await vscode.workspace.fs.writeFile(
                vscode.Uri.file(filePath),
                buffer
              );

              const openFile = "Open File";
              const result = await vscode.window.showInformationMessage(
                `Screenshot saved to ${fileName}`,
                openFile
              );

              if (result === openFile) {
                const doc = await vscode.workspace.openTextDocument(filePath);
                await vscode.window.showTextDocument(doc);
              }
            } catch (error) {
              vscode.window.showErrorMessage(
                `Failed to save screenshot: ${error}`
              );
            }
            break;
          case "copyMermaid":
            try {
              await vscode.env.clipboard.writeText(message.data);

              vscode.window.showInformationMessage(
                "Mermaid diagram copied to clipboard"
              );
            } catch (error) {
              vscode.window.showErrorMessage(
                `Failed to copy Mermaid diagram: ${error}`
              );
            }
            break;
        }
      },
      undefined,
      context.subscriptions
    );
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
