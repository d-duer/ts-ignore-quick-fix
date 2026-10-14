import * as assert from 'assert';
import * as vscode from 'vscode';

const SOURCE = 'const a: number = "not a number";\n';

const openWithTsError = async (): Promise<vscode.TextDocument> => {
	const document = await vscode.workspace.openTextDocument({ language: 'typescript', content: SOURCE });
	await vscode.window.showTextDocument(document);

	// Wait for the TypeScript server to report the type error
	for (let i = 0; i < 100; i++) {
		if (vscode.languages.getDiagnostics(document.uri).some((d) => d.source === 'ts')) {
			return document;
		}
		await new Promise((resolve) => setTimeout(resolve, 200));
	}
	throw new Error('Timed out waiting for TypeScript diagnostics');
};

const getQuickFixes = async (document: vscode.TextDocument): Promise<vscode.CodeAction[]> => {
	const range = vscode.languages.getDiagnostics(document.uri)[0].range;
	const actions = await vscode.commands.executeCommand<vscode.CodeAction[]>(
		'vscode.executeCodeActionProvider', document.uri, range, vscode.CodeActionKind.QuickFix.value
	);
	return actions ?? [];
};

const applyFix = async (document: vscode.TextDocument, title: string): Promise<string> => {
	const fix = (await getQuickFixes(document)).find((action) => action.title === title);
	assert.ok(fix?.edit, `Expected a "${title}" quick fix`);
	await vscode.workspace.applyEdit(fix.edit);
	return document.getText();
};

const setDirective = (value: string | undefined) =>
	vscode.workspace.getConfiguration('ts-ignore-quick-fix')
		.update('ignoreOrExpect', value, vscode.ConfigurationTarget.Global);

suite('Quick Fix', () => {
	teardown(async () => {
		await setDirective(undefined);
		await vscode.commands.executeCommand('workbench.action.revertAndCloseActiveEditor');
	});

	test('inserts // @ts-ignore by default', async () => {
		const document = await openWithTsError();
		assert.strictEqual(await applyFix(document, 'ts-ignore this line'), `// @ts-ignore\n${SOURCE}`);
	});

	test('inserts // @ts-expect-error when configured', async () => {
		await setDirective('ts-expect-error');
		const document = await openWithTsError();
		assert.strictEqual(await applyFix(document, 'ts-expect-error this line'), `// @ts-expect-error\n${SOURCE}`);
	});

	test('inserts // @ts-nocheck at the top of the file', async () => {
		const document = await openWithTsError();
		assert.strictEqual(await applyFix(document, 'ts-nocheck this file'), `// @ts-nocheck\n${SOURCE}`);
	});
});
