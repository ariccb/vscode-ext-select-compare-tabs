const { log } = require("console");
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

function Extension() {
  let file1;
  let file2;

  /**
   * @param {vscode.Uri} uri
   */
  this.selectForCompare = function (uri) {
    // Set file 1
    file1 = uri;
    // Set context compareEnabled = true
    vscode.commands.executeCommand("setContext", "select-compare-tabs.compareEnabled", true);
  };

  /**
   * @param {vscode.Uri} uri
   */
  this.compareWithSelected = function (uri) {
    // Set file 2
    file2 = uri;
    // Open diff editor
    vscode.commands.executeCommand("vscode.diff", file1, file2);
    // Set context compareEnabled = false
    vscode.commands.executeCommand("setContext", "select-compare-tabs.compareEnabled", false);
  };

  this.swapFiles = function () {
    // Get visible editors in diff panel
    let selectedEditors = vscode.window.visibleTextEditors;
    // Switch files and set

    if (typeof selectedEditors[2] !== "undefined") {
      file1 = selectedEditors[2].document.uri;
      file2 = selectedEditors[1].document.uri;
    } else {
      file1 = selectedEditors[1].document.uri;
      file2 = selectedEditors[0].document.uri;
    }

    // Close diff editor
    vscode.commands.executeCommand("workbench.action.closeActiveEditor");
    // Open new diff editor
    vscode.commands.executeCommand("vscode.diff", file1, file2);
  };

  this.compareFileWithClipboard = async function (uri) {
    // Get the clipboard contents
    const clipboardContents = await vscode.env.clipboard.readText();

    // Get the file path from the configuration
    const config = vscode.workspace.getConfiguration("selectCompareTabs");
    const filePath = config.get("clipboardFilePath");

    if (!filePath) {
      vscode.window.showErrorMessage("Clipboard file path is not set in the configuration.");
      return;
    }

    // Save the clipboard contents to the static file
    fs.writeFileSync(filePath, clipboardContents);

    // Open the file in VS Code to trigger auto-save and formatting
    const document = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(document);
    await document.save();

    // Set file1 to the selected file
    file1 = uri;

    // Create a URI for the static file
    file2 = vscode.Uri.file(filePath);

    // Open diff editor
    vscode.commands.executeCommand("vscode.diff", file1, file2);
  };
}

function activate(context) {
  // INIT EXTENSION
  let ext = new Extension();

  // COMMANDS
  context.subscriptions.push(
    vscode.commands.registerCommand("select-compare-tabs.selectForCompare", function (event) {
      // selectForCompare
      ext.selectForCompare(event);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("select-compare-tabs.compareWithSelected", function (event) {
      // compareWithSelected
      ext.compareWithSelected(event);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("select-compare-tabs.swapFiles", function () {
      // swapFiles
      ext.swapFiles();
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("select-compare-tabs.compareFileWithClipboard", function (event) {
      // compareFileWithClipboard
      ext.compareFileWithClipboard(event);
    })
  );
}

exports.activate = activate;
