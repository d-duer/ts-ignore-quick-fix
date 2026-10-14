import {
    CodeActionProvider,
    Selection,
    TextDocument,
    Range,
    CodeActionContext,
    CancellationToken,
    CodeAction,
    DiagnosticSeverity,
    Diagnostic,
    CodeActionKind,
    WorkspaceEdit,
    Position,
} from "vscode";
import { ConfigId, Configs, getConfig } from "./config";

const createFixLine = (
  document: TextDocument,
  diagnostic: Diagnostic
): CodeAction => {
  const line = document.lineAt(diagnostic.range.start.line);
  const directive =
    getConfig<Configs[ConfigId.IgnoreOrExpect]>(ConfigId.IgnoreOrExpect) ??
    "ts-ignore";

  const fix = new CodeAction(
    `${directive} this line`,
    CodeActionKind.QuickFix
  );
  fix.edit = new WorkspaceEdit();
  fix.edit.insert(
    document.uri,
    new Position(line.lineNumber, 0),
    `// @${directive}\n`
  );
  return fix;
};

const createFixFile = (
  code: string | number,
  document: TextDocument
): CodeAction => {
  const fix = new CodeAction(
    `ts-nocheck this file`,
    CodeActionKind.QuickFix
  );
  fix.edit = new WorkspaceEdit();
  fix.edit.insert(
    document.uri,
    new Position(0, 0),
    `// @ts-nocheck\n`
  );
  return fix;
};

const createFix = (
  document: TextDocument,
  diagnostics: Diagnostic[]
): CodeAction[] => {
  return diagnostics.flatMap((diagnostic) => {
    const code =
      typeof diagnostic.code === "object"
        ? diagnostic.code.value
        : diagnostic.code;

    if (code === null || code === undefined || code === "") {
      return [];
    } else {
      return [
        createFixLine(document, diagnostic),
        createFixFile(code, document),
      ];
    }
  });
};

export const provideCodeActions = (
  document: TextDocument,
  range: Range | Selection,
  context: CodeActionContext,
  token: CancellationToken
): CodeAction[] => {
  const diagnostics = context.diagnostics.filter(
    (diagnostic) => diagnostic.source === 'ts'
  );
  return diagnostics.length > 0 ? createFix(document, diagnostics) : [];
};