import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // Test command to trigger Copilot suggestions
    let disposable = vscode.commands.registerCommand('testCopilot.triggerSuggestion', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor');
            return;
        }

        try {
            // Method 1: Trigger inline suggestions
            await vscode.commands.executeCommand('editor.action.inlineSuggest.trigger');

            // Method 2: Check if Copilot extension is available
            const copilotExtension = vscode.extensions.getExtension('GitHub.copilot');
            if (copilotExtension) {
                vscode.window.showInformationMessage('Copilot extension found and suggestion triggered');
            } else {
                vscode.window.showWarningMessage('Copilot extension not found');
            }

        } catch (error) {
            vscode.window.showErrorMessage(`Error accessing Copilot: ${error}`);
        }
    });

    // Register inline completion provider that could work with Copilot
    const provider = vscode.languages.registerInlineCompletionItemProvider(
        { pattern: '**' },
        {
            provideInlineCompletionItems: async (document, position, context, token) => {
                // This is where we could potentially intercept or coordinate with Copilot
                console.log('Inline completion requested at:', position);
                return [];
            }
        }
    );

    context.subscriptions.push(disposable, provider);
}

export function deactivate() {}