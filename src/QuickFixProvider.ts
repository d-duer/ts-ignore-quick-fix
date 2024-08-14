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

const FIXABLE_SEVERITIES = [
  DiagnosticSeverity.Warning,
  DiagnosticSeverity.Information,
];

const createFixLine = (
  document: TextDocument,
  diagnostic: Diagnostic
): CodeAction => {
  const line = document.lineAt(diagnostic.range.start.line);
  const disabledLine = line.text.includes(" // @ts-ignore ");

  const fix = new CodeAction(
    `ts-ignore this line`,
    CodeActionKind.QuickFix
  );
  fix.edit = new WorkspaceEdit();
  fix.edit.insert(
    document.uri,
    new Position(line.lineNumber, 0),
    disabledLine ? `,noUnusedLocals` : `// @ts-ignore\n`
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