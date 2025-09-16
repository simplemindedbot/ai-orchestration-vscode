/**
 * Example VS Code Extension Connector for Continue
 *
 * This demonstrates how to integrate the Continue AI extension
 * into the orchestration system.
 */

import * as vscode from 'vscode';
import { ToolConnector, Task, WorkspaceContext, ToolResponse } from '../../../src/types';

interface ContinueConfig {
  enableChat: boolean;
  enableEdit: boolean;
  enableCompletion: boolean;
  maxResponseTime: number;
}

/**
 * Connector for the Continue VS Code extension
 * https://marketplace.visualstudio.com/items?itemName=Continue.continue
 */
export class ContinueConnector extends ToolConnector {
  private extension: vscode.Extension<any> | null = null;
  private isInitialized = false;

  constructor(private config: ContinueConfig) {
    super();
  }

  async connect(): Promise<vscode.Extension<any>> {
    if (this.extension && this.isInitialized) {
      return this.extension;
    }

    this.extension = vscode.extensions.getExtension('Continue.continue');
    if (!this.extension) {
      throw new Error('Continue extension not found');
    }

    if (!this.extension.isActive) {
      await this.extension.activate();
    }

    this.isInitialized = true;
    return this.extension;
  }

  async invoke(task: Task, context: WorkspaceContext): Promise<ToolResponse> {
    const extension = await this.connect();

    try {
      switch (task.type) {
        case 'completion':
          return await this.handleCompletion(task, context);
        case 'planning':
          return await this.handlePlanning(task, context);
        case 'refactoring':
          return await this.handleRefactoring(task, context);
        case 'analysis':
          return await this.handleAnalysis(task, context);
        default:
          return await this.handleGenericTask(task, context);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        toolId: 'continue',
        metadata: {
          taskType: task.type,
          errorType: error.constructor.name
        }
      };
    }
  }

  async testHealth(): Promise<boolean> {
    try {
      const extension = vscode.extensions.getExtension('Continue.continue');
      return extension?.isActive || false;
    } catch {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    // VS Code extensions don't need explicit disconnection
    this.isInitialized = false;
  }

  /**
   * Handle code completion requests
   */
  private async handleCompletion(task: Task, context: WorkspaceContext): Promise<ToolResponse> {
    if (!this.config.enableCompletion) {
      throw new Error('Completion not enabled for Continue');
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      throw new Error('No active editor for completion');
    }

    // Use Continue's quick edit feature
    const result = await vscode.commands.executeCommand(
      'continue.quickEdit',
      task.description
    );

    return {
      success: true,
      data: {
        type: 'completion',
        suggestion: result,
        position: editor.selection.active
      },
      toolId: 'continue',
      metadata: {
        method: 'quickEdit',
        editor: editor.document.fileName
      }
    };
  }

  /**
   * Handle planning and architecture tasks
   */
  private async handlePlanning(task: Task, context: WorkspaceContext): Promise<ToolResponse> {
    if (!this.config.enableChat) {
      throw new Error('Chat not enabled for Continue');
    }

    // Use Continue's chat interface for planning
    const chatMessage = this.buildPlanningPrompt(task, context);

    const result = await vscode.commands.executeCommand(
      'continue.sendChatMessage',
      chatMessage
    );

    return {
      success: true,
      data: {
        type: 'planning',
        plan: result,
        context: this.summarizeContext(context)
      },
      toolId: 'continue',
      metadata: {
        method: 'chat',
        promptLength: chatMessage.length
      }
    };
  }

  /**
   * Handle refactoring requests
   */
  private async handleRefactoring(task: Task, context: WorkspaceContext): Promise<ToolResponse> {
    if (!this.config.enableEdit) {
      throw new Error('Edit not enabled for Continue');
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      throw new Error('No active editor for refactoring');
    }

    // Build refactoring prompt
    const refactorPrompt = this.buildRefactoringPrompt(task, context);

    // Use Continue's edit functionality
    const result = await vscode.commands.executeCommand(
      'continue.continueEdit',
      refactorPrompt
    );

    return {
      success: true,
      data: {
        type: 'refactoring',
        changes: result,
        originalCode: editor.document.getText(editor.selection),
        fileName: editor.document.fileName
      },
      toolId: 'continue',
      metadata: {
        method: 'continueEdit',
        selectionRange: editor.selection
      }
    };
  }

  /**
   * Handle code analysis requests
   */
  private async handleAnalysis(task: Task, context: WorkspaceContext): Promise<ToolResponse> {
    const analysisPrompt = this.buildAnalysisPrompt(task, context);

    const result = await vscode.commands.executeCommand(
      'continue.sendChatMessage',
      analysisPrompt
    );

    return {
      success: true,
      data: {
        type: 'analysis',
        analysis: result,
        scope: this.getAnalysisScope(context)
      },
      toolId: 'continue',
      metadata: {
        method: 'chat',
        filesAnalyzed: context.openFiles.length
      }
    };
  }

  /**
   * Handle generic tasks using Continue's chat
   */
  private async handleGenericTask(task: Task, context: WorkspaceContext): Promise<ToolResponse> {
    const genericPrompt = `${task.description}\n\nContext: ${this.summarizeContext(context)}`;

    const result = await vscode.commands.executeCommand(
      'continue.sendChatMessage',
      genericPrompt
    );

    return {
      success: true,
      data: {
        type: 'generic',
        response: result
      },
      toolId: 'continue',
      metadata: {
        method: 'chat',
        taskType: task.type
      }
    };
  }

  /**
   * Build planning-specific prompt
   */
  private buildPlanningPrompt(task: Task, context: WorkspaceContext): string {
    return `
Please help me plan the following:
${task.description}

Current project context:
- Project type: ${context.projectInfo.type}
- Technologies: ${context.projectInfo.technologies.join(', ')}
- Open files: ${context.openFiles.map(f => f.path).join(', ')}

Please provide:
1. High-level architecture approach
2. Key components and their responsibilities
3. Implementation steps
4. Potential challenges and solutions

Focus on ${task.language || 'the current'} language best practices.
    `.trim();
  }

  /**
   * Build refactoring-specific prompt
   */
  private buildRefactoringPrompt(task: Task, context: WorkspaceContext): string {
    const editor = vscode.window.activeTextEditor;
    const selectedText = editor?.document.getText(editor.selection) || '';

    return `
Please refactor the following code according to this request:
${task.description}

Code to refactor:
\`\`\`${task.language || 'javascript'}
${selectedText}
\`\`\`

Project context:
- File: ${editor?.document.fileName}
- Project type: ${context.projectInfo.type}
- Technologies: ${context.projectInfo.technologies.join(', ')}

Please provide improved code that maintains functionality while addressing the request.
    `.trim();
  }

  /**
   * Build analysis-specific prompt
   */
  private buildAnalysisPrompt(task: Task, context: WorkspaceContext): string {
    return `
Please analyze the following code/project according to this request:
${task.description}

Current context:
${this.summarizeContext(context)}

Please provide:
1. Key findings and observations
2. Potential issues or improvements
3. Recommendations and next steps
4. Best practices considerations

Focus on ${task.language || 'general'} best practices and maintainability.
    `.trim();
  }

  /**
   * Summarize workspace context for prompts
   */
  private summarizeContext(context: WorkspaceContext): string {
    const summary = [
      `Project: ${context.projectInfo.type}`,
      `Technologies: ${context.projectInfo.technologies.join(', ')}`,
      `Open files: ${context.openFiles.length}`,
    ];

    if (context.openFiles.length > 0) {
      summary.push(`Current files: ${context.openFiles.map(f => f.path).join(', ')}`);
    }

    return summary.join('\n');
  }

  /**
   * Get analysis scope description
   */
  private getAnalysisScope(context: WorkspaceContext): string {
    if (context.selection) {
      return 'selected code';
    } else if (context.openFiles.length === 1) {
      return 'current file';
    } else if (context.openFiles.length > 1) {
      return 'multiple open files';
    } else {
      return 'project level';
    }
  }
}

/**
 * Configuration helper for Continue connector
 */
export function createContinueConfig(options: Partial<ContinueConfig> = {}): ContinueConfig {
  return {
    enableChat: options.enableChat ?? true,
    enableEdit: options.enableEdit ?? true,
    enableCompletion: options.enableCompletion ?? true,
    maxResponseTime: options.maxResponseTime ?? 30000
  };
}

/**
 * Capability testing for Continue extension
 */
export async function testContinueCapabilities(): Promise<string[]> {
  const extension = vscode.extensions.getExtension('Continue.continue');
  if (!extension?.isActive) {
    return [];
  }

  const capabilities: string[] = [];

  // Test available commands
  const commands = await vscode.commands.getCommands();

  if (commands.includes('continue.quickEdit')) {
    capabilities.push('completion', 'refactoring');
  }

  if (commands.includes('continue.sendChatMessage')) {
    capabilities.push('planning', 'analysis', 'general-purpose');
  }

  if (commands.includes('continue.continueEdit')) {
    capabilities.push('code-editing');
  }

  return capabilities;
}

// Example usage and registration:
/*
// Register Continue connector
const continueConfig = createContinueConfig({
  enableChat: true,
  enableEdit: true,
  enableCompletion: true
});

const continueConnector = new ContinueConnector(continueConfig);

// Add to orchestration system
await toolDiscovery.registerCustomTool({
  id: 'continue',
  name: 'Continue AI',
  type: 'vscode-extension',
  capabilities: {
    tasks: await testContinueCapabilities(),
    languages: ['javascript', 'typescript', 'python', 'java', 'csharp', 'rust', 'go'],
    integrations: ['vscode'],
    commands: ['continue.quickEdit', 'continue.sendChatMessage', 'continue.continueEdit']
  }
}, continueConnector);
*/