# Agent Context Protocol (ACP) Integration Strategy

## Overview

Zed Industries' Agent Context Protocol (ACP) represents a breakthrough for our orchestration architecture - it's essentially the "LSP for AI agents" that standardizes how editors communicate with AI coding agents.

**Key Insight**: ACP could transform our VS Code-focused orchestration into a **universal, cross-editor AI orchestration platform**.

## What is ACP?

### Technical Foundation
- **JSON-RPC over stdio** communication (like LSP)
- **Reuses MCP specifications** where possible with custom extensions
- **Open source** under Apache License
- **Language support**: TypeScript and Rust libraries available

### Current Ecosystem (2025)
- **Zed Editor**: Native ACP support
- **Neovim**: Code Companion plugin provides ACP support
- **Agents**: Claude Code, Gemini CLI, custom agents
- **VS Code**: No native support yet (opportunity!)

## Strategic Opportunities

### 1. Cross-Editor Orchestration 🌐

Instead of being VS Code-specific, our orchestration could coordinate agents across multiple editors:

```typescript
interface CrossEditorOrchestration {
  // Discover ACP agents across all running editors
  discoverACPAgents(): Promise<ACPAgent[]>;

  // Route tasks to best agent regardless of which editor it's in
  routeTaskCrossEditor(task: Task): Promise<RoutingPlan>;

  // Coordinate multi-editor workflows
  orchestrateWorkflow(workflow: Workflow, editors: Editor[]): Promise<void>;
}
```

### 2. Unified Agent Discovery 🔍

Extend our discovery engine to find ACP agents:

```typescript
class ACPAgentDiscovery {
  async discoverACPAgents(): Promise<DiscoveredTool[]> {
    const agents: DiscoveredTool[] = [];

    // Scan for running ACP agents
    const runningAgents = await this.scanRunningACPProcesses();

    for (const agent of runningAgents) {
      agents.push({
        id: agent.name,
        name: agent.displayName,
        type: 'acp-agent',
        capabilities: await this.probeACPCapabilities(agent),
        connector: new ACPConnector(agent.endpoint),
        isHealthy: true,
        lastChecked: new Date()
      });
    }

    return agents;
  }
}
```

### 3. ACP Connector Implementation 🔌

```typescript
class ACPConnector extends ToolConnector {
  constructor(private agentEndpoint: string) {
    super();
  }

  async connect(): Promise<ACPConnection> {
    // Establish JSON-RPC connection over stdio
    const connection = new ACPConnection(this.agentEndpoint);
    await connection.initialize();
    return connection;
  }

  async invoke(task: Task, context: WorkspaceContext): Promise<ToolResponse> {
    const connection = await this.connect();

    // Send task to ACP agent using standardized protocol
    const response = await connection.request({
      method: 'agent/execute',
      params: {
        task: task.description,
        context: this.serializeWorkspaceContext(context),
        capabilities: task.requiredCapabilities
      }
    });

    return {
      success: true,
      data: response.result,
      toolId: 'acp-agent',
      metadata: {
        agentName: connection.agentName,
        protocol: 'acp'
      }
    };
  }
}
```

## Integration Benefits

### 1. Editor Agnostic 🎯
- Works with Zed, VS Code, Neovim, and future ACP-supporting editors
- Users can switch editors without losing orchestration capabilities
- True editor independence for AI agent coordination

### 2. Standardized Agent Communication 📡
- Leverages existing ACP protocol instead of custom integrations
- Automatic compatibility with new ACP agents
- Reduced integration complexity

### 3. Cross-Editor Workflows 🔄
- Start task in VS Code, continue in Zed
- Different editors for different parts of the same project
- Team members using different editors can share orchestration

### 4. Enhanced Agent Ecosystem 🌟
- Access to all ACP agents, not just VS Code extensions
- Claude Code, Gemini CLI, and custom agents
- Future ACP agents automatically supported

## Implementation Phases

### Phase 1: ACP Discovery
- [ ] Detect running ACP agents across system
- [ ] Probe ACP agent capabilities through protocol
- [ ] Add ACP agents to unified tool registry

### Phase 2: ACP Connector
- [ ] Implement ACPConnector class
- [ ] Handle JSON-RPC communication over stdio
- [ ] Support ACP protocol message formats

### Phase 3: Cross-Editor Support
- [ ] Extend discovery to multiple editors
- [ ] Coordinate tasks across different editors
- [ ] Handle editor-specific context differences

### Phase 4: Advanced Orchestration
- [ ] Multi-editor workflow templates
- [ ] Editor preference routing (some tasks better in certain editors)
- [ ] Cross-editor collaboration features

## Technical Considerations

### Protocol Compatibility
- **MCP Overlap**: ACP reuses MCP specs where possible - leverage existing MCP knowledge
- **JSON-RPC**: Same communication pattern as LSP - familiar territory
- **Stdio Communication**: Process-based communication, different from web-based protocols

### Discovery Challenges
- **Process Detection**: Finding running ACP agents across system
- **Editor Integration**: Different editors may expose ACP agents differently
- **Capability Testing**: Standardized way to test what each ACP agent can do

### Context Translation
- **Workspace Context**: Different editors have different workspace models
- **File Access**: Ensuring ACP agents can access necessary files
- **Editor State**: Translating VS Code state to editor-agnostic format

## Competitive Advantages

### For Users
- **Editor Freedom**: Use orchestration with any ACP-supporting editor
- **Agent Choice**: Access to broader ecosystem of ACP agents
- **Workflow Continuity**: Seamless experience across different tools

### For Adoption
- **Broader Market**: Not limited to VS Code users
- **Standards-Based**: Building on emerging open standards
- **Future-Proof**: Adapts as ACP ecosystem grows

## Example Workflows

### Cross-Editor Development
```
1. Plan architecture in Zed using Claude Code (ACP)
2. Implement in VS Code using GitHub Copilot (Extension API)
3. Review in Neovim using custom ACP agent
4. Deploy using AWS Q (Extension API) back in VS Code
```

### Team Collaboration
```
- Developer A (VS Code user): Creates feature plan using orchestration
- Developer B (Zed user): Implements using same orchestration system
- Developer C (Neovim user): Reviews using shared orchestration preferences
```

## Strategic Impact

This ACP integration could position our orchestration system as the **universal AI agent coordinator** for developers, regardless of their editor choice. It transforms us from a VS Code extension into a **platform-agnostic development intelligence hub**.

**Vision**: Any developer, using any ACP-supporting editor, can benefit from intelligent AI agent orchestration - making our system the standard way developers coordinate AI assistance across their entire toolkit.

---

**Next Steps**:
1. Research ACP protocol specifications in detail
2. Build proof-of-concept ACP connector
3. Test with Claude Code and Gemini CLI agents
4. Extend discovery engine for cross-editor support