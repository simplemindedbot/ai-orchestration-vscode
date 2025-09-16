# AI Tool Integration Guide

This guide explains how to integrate new AI tools and assistants into the orchestration system.

## Integration Types

### 1. MCP Server Integration

**Best for**: AI tools that provide or can provide MCP server interfaces

**Steps**:
1. Ensure the tool exposes an MCP server endpoint
2. Add server configuration to discovery targets
3. Implement capability mapping for the tool's specific features

**Example Configuration**:
```typescript
const mcpConfig = {
  name: 'custom-ai-tool',
  endpoint: 'localhost:3003',
  capabilities: ['code-analysis', 'documentation', 'refactoring'],
  authentication: {
    type: 'bearer',
    tokenEnvVar: 'CUSTOM_AI_TOKEN'
  }
};
```

### 2. VS Code Extension Integration

**Best for**: AI tools available as VS Code extensions

**Steps**:
1. Add extension ID to the known assistants list
2. Define capability testing commands
3. Implement extension-specific invocation methods

**Example Integration**:
```typescript
const extensionConfig = {
  'CustomAI.vscode-extension': {
    expectedCapabilities: ['completion', 'chat', 'analysis'],
    testCommands: ['customai.triggerCompletion'],
    invocationMethods: {
      completion: 'customai.getCompletion',
      chat: 'customai.startChat'
    }
  }
};
```

### 3. CLI Tool Integration

**Best for**: Command-line AI tools and utilities

**Steps**:
1. Add CLI command to discovery candidates
2. Define capability probing commands
3. Implement argument building for different task types

**Example Integration**:
```typescript
const cliConfig = {
  command: 'my-ai-tool',
  name: 'My AI Tool',
  capabilities: ['analysis', 'generation'],
  testCommand: ['--version'],
  taskMappings: {
    analysis: ['analyze', '--input'],
    generation: ['generate', '--prompt']
  }
};
```

### 4. Direct API Integration

**Best for**: AI services with REST APIs

**Steps**:
1. Implement API connector class
2. Define authentication and rate limiting
3. Map API capabilities to orchestration tasks

**Example Integration**:
```typescript
class CustomAPIConnector extends ToolConnector {
  async invoke(task: Task): Promise<ToolResponse> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: task.description,
        type: task.type,
        context: task.context
      })
    });

    return await response.json();
  }
}
```

## Capability Definition

### Standard Capability Types

- **`code-completion`** - Inline code suggestions and completion
- **`planning`** - Architecture and design planning
- **`analysis`** - Code analysis and review
- **`deployment`** - Infrastructure and deployment tasks
- **`testing`** - Test generation and execution
- **`refactoring`** - Code restructuring and optimization
- **`documentation`** - Documentation generation
- **`debugging`** - Error diagnosis and fixing
- **`security`** - Security analysis and recommendations

### Custom Capabilities

Define domain-specific capabilities:

```typescript
interface CustomCapabilities extends ToolCapabilities {
  tasks: string[]; // Include custom task types
  specializations: string[]; // e.g., ['frontend', 'backend', 'mobile']
  contextLimits: {
    maxTokens: number;
    maxFiles: number;
  };
  outputFormats: string[]; // e.g., ['markdown', 'json', 'code']
}
```

## Discovery Integration

### Automatic Discovery

Add your tool to the appropriate discovery method:

```typescript
// For MCP servers
private getCommonMCPPorts(): DiscoveryTarget[] {
  return [
    { endpoint: 'localhost:3001', name: 'claude' },
    { endpoint: 'localhost:3002', name: 'custom-tool' },
    { endpoint: 'localhost:3003', name: 'your-tool' } // Add here
  ];
}

// For VS Code extensions
const knownAssistants = {
  'GitHub.copilot': { /* config */ },
  'YourCompany.your-ai-extension': { // Add here
    expectedCapabilities: ['your-capabilities'],
    testCommands: ['your.test.command']
  }
};
```

### Manual Registration

For tools that require manual setup:

```typescript
const orchestrator = new AIOrchestrator();
await orchestrator.registerTool({
  id: 'manual-tool',
  name: 'Manually Registered Tool',
  type: 'api-service',
  capabilities: {
    tasks: ['custom-task'],
    languages: ['javascript', 'python'],
    integrations: []
  },
  connector: new YourCustomConnector(config)
});
```

## Testing Integration

### Unit Tests

Create tests for your connector:

```typescript
describe('CustomToolConnector', () => {
  it('should connect successfully', async () => {
    const connector = new CustomToolConnector(config);
    const connection = await connector.connect();
    expect(connection).toBeDefined();
  });

  it('should handle completion tasks', async () => {
    const task: Task = {
      type: 'completion',
      description: 'Complete this function',
      context: mockContext
    };

    const response = await connector.invoke(task, mockContext);
    expect(response.success).toBe(true);
  });
});
```

### Integration Tests

Test with the full orchestration system:

```typescript
describe('Tool Integration', () => {
  it('should discover and route to custom tool', async () => {
    const discovery = new ToolDiscovery();
    await discovery.initializeDiscovery();

    const tools = discovery.getDiscoveredTools();
    expect(tools.has('your-tool-id')).toBe(true);

    const router = new AdaptiveTaskRouter(tools, config);
    const plan = await router.routeTask(testTask);
    expect(plan.primary.id).toBe('your-tool-id');
  });
});
```

## Best Practices

### Error Handling

- Implement graceful failure modes
- Provide clear error messages for debugging
- Support retry logic for transient failures

```typescript
async invoke(task: Task): Promise<ToolResponse> {
  try {
    return await this.performTask(task);
  } catch (error) {
    if (this.isRetryableError(error)) {
      return await this.performTaskWithRetry(task);
    }
    throw new ToolError(`Tool failed: ${error.message}`, error);
  }
}
```

### Authentication

- Store credentials securely
- Support multiple authentication methods
- Implement token refresh where applicable

```typescript
class SecureConnector extends ToolConnector {
  private async getAuthToken(): Promise<string> {
    // Implement secure token retrieval
    return process.env.TOOL_TOKEN || await this.refreshToken();
  }
}
```

### Rate Limiting

- Respect API rate limits
- Implement backoff strategies
- Cache responses where appropriate

```typescript
class RateLimitedConnector extends ToolConnector {
  private rateLimiter = new RateLimiter(100, 'minute');

  async invoke(task: Task): Promise<ToolResponse> {
    await this.rateLimiter.waitForToken();
    return await this.performTask(task);
  }
}
```

### Performance

- Minimize connection overhead
- Support streaming responses for long operations
- Implement connection pooling where beneficial

```typescript
class PerformantConnector extends ToolConnector {
  private connectionPool = new ConnectionPool(maxConnections);

  async invoke(task: Task): Promise<ToolResponse> {
    const connection = await this.connectionPool.acquire();
    try {
      return await connection.execute(task);
    } finally {
      this.connectionPool.release(connection);
    }
  }
}
```

## Configuration Schema

### Tool Configuration

```typescript
interface ToolConfig {
  id: string;
  name: string;
  type: 'mcp-server' | 'vscode-extension' | 'cli-tool' | 'api-service';

  // Connection details
  endpoint?: string;
  command?: string;
  extensionId?: string;

  // Capabilities
  capabilities: ToolCapabilities;

  // Authentication
  authentication?: {
    type: 'none' | 'bearer' | 'api-key' | 'oauth';
    tokenEnvVar?: string;
    refreshUrl?: string;
  };

  // Performance
  rateLimit?: {
    requests: number;
    period: 'second' | 'minute' | 'hour';
  };

  // Health checking
  healthCheck?: {
    endpoint?: string;
    command?: string;
    interval: number;
  };
}
```

## Example: Complete Integration

Here's a complete example of integrating a hypothetical "CodeMentor AI" tool:

```typescript
// 1. Define the connector
class CodeMentorConnector extends ToolConnector {
  constructor(private config: CodeMentorConfig) {
    super();
  }

  async connect(): Promise<Connection> {
    const client = new CodeMentorClient({
      apiKey: process.env.CODE_MENTOR_API_KEY,
      endpoint: this.config.endpoint
    });
    await client.authenticate();
    return new CodeMentorConnection(client);
  }

  async invoke(task: Task, context: WorkspaceContext): Promise<ToolResponse> {
    const connection = await this.connect();

    switch (task.type) {
      case 'analysis':
        return await connection.analyzeCode(task.description, context);
      case 'planning':
        return await connection.generatePlan(task.description, context);
      default:
        throw new Error(`Unsupported task type: ${task.type}`);
    }
  }

  async testHealth(): Promise<boolean> {
    try {
      const connection = await this.connect();
      return await connection.ping();
    } catch {
      return false;
    }
  }
}

// 2. Register with discovery system
const codementor: ToolConfig = {
  id: 'codementor-ai',
  name: 'CodeMentor AI',
  type: 'api-service',
  endpoint: 'https://api.codementor.ai/v1',
  capabilities: {
    tasks: ['analysis', 'planning', 'code-review'],
    languages: ['javascript', 'python', 'java', 'csharp'],
    integrations: ['github', 'gitlab']
  },
  authentication: {
    type: 'api-key',
    tokenEnvVar: 'CODE_MENTOR_API_KEY'
  },
  rateLimit: {
    requests: 100,
    period: 'minute'
  }
};

// 3. Add to discovery targets
discovery.addCustomTool(codemental, new CodeMentorConnector(codemental));
```

This integration provides CodeMentor AI with full orchestration support, including automatic discovery, capability testing, health monitoring, and task routing.