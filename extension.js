const { log } = require("console");
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const os = require("os");

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
    if (file1 && file2) {
      vscode.commands.executeCommand("vscode.diff", file1, file2);
      // Set context compareEnabled = false
      vscode.commands.executeCommand("setContext", "select-compare-tabs.compareEnabled", false);
    } else {
      vscode.window.showErrorMessage("Both files must be selected for comparison.");
    }
  };

  this.compareFileWithClipboard = async function (uri) {
    try {
      // Set file1 to the selected file
      file1 = uri;

      // Get the clipboard contents
      const clipboardContents = await vscode.env.clipboard.readText();

      // Get the file path from the configuration
      const config = vscode.workspace.getConfiguration("selectCompareTabs");
      let filePath = config.get("clipboardFilePath");

      if (!filePath) {
        vscode.window.showErrorMessage("Clipboard file path is not set in the configuration.");
        return;
      }

      // Expand tilde to home directory
      if (filePath.startsWith("~")) {
        filePath = path.join(os.homedir(), filePath.slice(1));
      }

      // Ensure the directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Save the clipboard contents to the static file
      fs.writeFileSync(filePath, clipboardContents);

      // Create a URI for the static file
      file2 = vscode.Uri.file(filePath);

      // Open diff editor
      if (file1 && file2) {
        vscode.commands.executeCommand("vscode.diff", file1, file2);
        // Set context compareEnabled = false
        vscode.commands.executeCommand("setContext", "select-compare-tabs.compareEnabled", false);
      } else {
        vscode.window.showErrorMessage("Both files must be selected for comparison.");
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Error comparing file with clipboard: ${error.message}`);
    }
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
    vscode.commands.registerCommand("select-compare-tabs.compareFileWithClipboard", function (event) {
      // compareFileWithClipboard
      ext.compareFileWithClipboard(event);
    })
  );
}

exports.activate = activate;
