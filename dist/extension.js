"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));

// src/QuickFixProvider.ts
var import_vscode = require("vscode");
var FIXABLE_SEVERITIES = [
  import_vscode.DiagnosticSeverity.Warning,
  import_vscode.DiagnosticSeverity.Information
];
var createFixLine = (document, diagnostic) => {
  const line = document.lineAt(diagnostic.range.start.line);
  const disabledLine = line.text.includes(" // @ts-ignore ");
  const fix = new import_vscode.CodeAction(
    `ts-ignore this line`,
    import_vscode.CodeActionKind.QuickFix
  );
  fix.edit = new import_vscode.WorkspaceEdit();
  fix.edit.insert(
    document.uri,
    new import_vscode.Position(line.lineNumber, 0),
    disabledLine ? `,noUnusedLocals` : `// @ts-ignore
`
  );
  return fix;
};
var createFixFile = (code, document) => {
  const fix = new import_vscode.CodeAction(
    `ts-nocheck this file`,
    import_vscode.CodeActionKind.QuickFix
  );
  fix.edit = new import_vscode.WorkspaceEdit();
  fix.edit.insert(
    document.uri,
    new import_vscode.Position(0, 0),
    `// @ts-nocheck
`
  );
  return fix;
};
var createFix = (document, diagnostics) => {
  return diagnostics.flatMap((diagnostic) => {
    const code = typeof diagnostic.code === "object" ? diagnostic.code.value : diagnostic.code;
    if (code === null || code === void 0 || code === "") {
      return [];
    } else {
      return [
        createFixLine(document, diagnostic),
        createFixFile(code, document)
      ];
    }
  });
};
var provideCodeActions = (document, range, context, token) => {
  const diagnostics = context.diagnostics.filter(
    (diagnostic) => diagnostic.source === "ts"
  );
  return diagnostics.length > 0 ? createFix(document, diagnostics) : [];
};

// src/extension.ts
function activate(context) {
  console.log('Congratulations, your extension "ts-ignore-quick-fix" is now active! 11');
  const disposable = vscode.commands.registerCommand("ts-ignore-quick-fix.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from ts-ignore Quick Fix!");
  });
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      "typescript",
      { provideCodeActions },
      {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
      }
    )
  );
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
