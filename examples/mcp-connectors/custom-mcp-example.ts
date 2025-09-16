/**
 * Example MCP Connector Implementation
 *
 * This demonstrates how to create a connector for a custom MCP server
 * that provides domain-specific AI capabilities.
 */

import { ToolConnector, Task, WorkspaceContext, ToolResponse, Connection } from '../../../src/types';

interface CustomMCPConfig {
  endpoint: string;
  apiKey?: string;
  timeout?: number;
  retryAttempts?: number;
}

interface CustomMCPTool {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
}

/**
 * Example connector for a custom MCP server that provides
 * specialized code analysis and optimization capabilities
 */
export class CustomMCPConnector extends ToolConnector {
  private client: CustomMCPClient | null = null;
  private availableTools: CustomMCPTool[] = [];

  constructor(private config: CustomMCPConfig) {
    super();
  }

  async connect(): Promise<Connection> {
    if (this.client) {
      return this.client;
    }

    this.client = new CustomMCPClient({
      endpoint: this.config.endpoint,
      apiKey: this.config.apiKey,
      timeout: this.config.timeout || 30000
    });

    await this.client.initialize();
    this.availableTools = await this.client.listTools();

    return this.client;
  }

  async invoke(task: Task, context: WorkspaceContext): Promise<ToolResponse> {
    const client = await this.connect();

    try {
      // Map task type to MCP tool
      const mcpTool = this.mapTaskToMCPTool(task);
      if (!mcpTool) {
        throw new Error(`No MCP tool available for task type: ${task.type}`);
      }

      // Prepare MCP request
      const mcpRequest = {
        method: 'tools/call',
        params: {
          name: mcpTool.name,
          arguments: {
            description: task.description,
            context: this.serializeContext(context),
            language: task.language,
            complexity: task.complexity
          }
        }
      };

      // Execute MCP request with retry logic
      const response = await this.executeWithRetry(client, mcpRequest);

      return {
        success: true,
        data: response.result,
        toolId: 'custom-mcp',
        metadata: {
          toolUsed: mcpTool.name,
          executionTime: response.executionTime,
          tokensUsed: response.tokensUsed
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        toolId: 'custom-mcp',
        metadata: {
          errorType: error.constructor.name,
          retryAttempts: this.config.retryAttempts || 0
        }
      };
    }
  }

  async testHealth(): Promise<boolean> {
    try {
      const client = await this.connect();
      const pingResponse = await client.request({
        method: 'ping',
        params: {}
      });
      return pingResponse.result === 'pong';
    } catch (error) {
      console.error('Custom MCP health check failed:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }

  /**
   * Map orchestration task types to specific MCP tools
   */
  private mapTaskToMCPTool(task: Task): CustomMCPTool | null {
    const taskToToolMap: Record<string, string> = {
      'analysis': 'code-analyzer',
      'optimization': 'performance-optimizer',
      'security': 'security-scanner',
      'refactoring': 'code-refactorer',
      'documentation': 'doc-generator'
    };

    const toolName = taskToToolMap[task.type];
    return this.availableTools.find(tool => tool.name === toolName) || null;
  }

  /**
   * Serialize workspace context for MCP transmission
   */
  private serializeContext(context: WorkspaceContext): any {
    return {
      openFiles: context.openFiles.map(file => ({
        path: file.path,
        content: file.content,
        language: file.language
      })),
      selection: context.selection,
      projectInfo: {
        type: context.projectInfo.type,
        technologies: context.projectInfo.technologies,
        dependencies: context.projectInfo.dependencies
      },
      workspaceRoot: context.workspaceRoot
    };
  }

  /**
   * Execute MCP request with retry logic
   */
  private async executeWithRetry(
    client: CustomMCPClient,
    request: any
  ): Promise<any> {
    const maxRetries = this.config.retryAttempts || 3;
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const response = await client.request(request);
        const executionTime = Date.now() - startTime;

        return {
          ...response,
          executionTime,
          attempt: attempt + 1
        };
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries && this.isRetryableError(error)) {
          const delayMs = Math.pow(2, attempt) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        break;
      }
    }

    throw lastError;
  }

  /**
   * Determine if an error is worth retrying
   */
  private isRetryableError(error: Error): boolean {
    const retryablePatterns = [
      /timeout/i,
      /connection reset/i,
      /server temporarily unavailable/i,
      /rate limit/i
    ];

    return retryablePatterns.some(pattern => pattern.test(error.message));
  }
}

/**
 * Simple MCP client implementation
 */
class CustomMCPClient {
  private ws: WebSocket | null = null;
  private requestId = 0;
  private pendingRequests = new Map<number, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }>();

  constructor(private config: {
    endpoint: string;
    apiKey?: string;
    timeout: number;
  }) {}

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = this.config.endpoint.replace(/^http/, 'ws');
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Custom MCP client connected');
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('Custom MCP client connection error:', error);
        reject(new Error('Failed to connect to MCP server'));
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };

      this.ws.onclose = () => {
        console.log('Custom MCP client disconnected');
        this.rejectPendingRequests(new Error('Connection closed'));
      };

      // Connection timeout
      setTimeout(() => {
        if (this.ws?.readyState !== WebSocket.OPEN) {
          reject(new Error('Connection timeout'));
        }
      }, this.config.timeout);
    });
  }

  async request(request: any): Promise<any> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('MCP client not connected');
    }

    const id = ++this.requestId;
    const message = {
      jsonrpc: '2.0',
      id,
      ...request
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });

      this.ws!.send(JSON.stringify(message));

      // Request timeout
      setTimeout(() => {
        const pending = this.pendingRequests.get(id);
        if (pending) {
          this.pendingRequests.delete(id);
          pending.reject(new Error('Request timeout'));
        }
      }, this.config.timeout);
    });
  }

  async listTools(): Promise<CustomMCPTool[]> {
    const response = await this.request({
      method: 'tools/list',
      params: {}
    });

    return response.result.tools;
  }

  async close(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.rejectPendingRequests(new Error('Client closing'));
  }

  private handleMessage(message: any): void {
    if (message.id && this.pendingRequests.has(message.id)) {
      const pending = this.pendingRequests.get(message.id)!;
      this.pendingRequests.delete(message.id);

      if (message.error) {
        pending.reject(new Error(message.error.message));
      } else {
        pending.resolve(message);
      }
    }
  }

  private rejectPendingRequests(error: Error): void {
    for (const pending of this.pendingRequests.values()) {
      pending.reject(error);
    }
    this.pendingRequests.clear();
  }
}

// Export configuration helper
export function createCustomMCPConfig(options: Partial<CustomMCPConfig>): CustomMCPConfig {
  return {
    endpoint: options.endpoint || 'ws://localhost:3003',
    apiKey: options.apiKey || process.env.CUSTOM_MCP_API_KEY,
    timeout: options.timeout || 30000,
    retryAttempts: options.retryAttempts || 3
  };
}

// Example usage:
/*
const config = createCustomMCPConfig({
  endpoint: 'ws://localhost:3003',
  apiKey: 'your-api-key'
});

const connector = new CustomMCPConnector(config);

// Register with discovery system
await toolDiscovery.registerCustomTool({
  id: 'custom-mcp',
  name: 'Custom MCP Server',
  type: 'mcp-server',
  capabilities: {
    tasks: ['analysis', 'optimization', 'security', 'refactoring'],
    languages: ['javascript', 'typescript', 'python'],
    integrations: []
  }
}, connector);
*/