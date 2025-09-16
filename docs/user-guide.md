# AI Orchestration User Guide

Welcome to the AI Orchestration system for VS Code! This guide will help you understand and use the multi-agent development environment.

## Overview

The AI Orchestration system transforms your VS Code into an intelligent development hub that automatically coordinates multiple AI assistants to help with your coding tasks. Instead of manually switching between different AI tools, the system intelligently routes tasks to the most appropriate AI assistant based on what you're trying to accomplish.

## Getting Started

### Installation

1. Install the AI Orchestration extension from the VS Code marketplace
2. The system will automatically discover available AI tools on your system
3. Configure your preferences (optional - the system works with intelligent defaults)

### First Time Setup

When you first launch the extension, it will:

1. **Scan for AI Tools**: Automatically discover GitHub Copilot, Claude MCP servers, AWS Toolkit, and other AI assistants
2. **Test Capabilities**: Verify what each tool can actually do
3. **Show Discovery Results**: Present what was found and their capabilities

## Core Concepts

### Dynamic Discovery

The system automatically finds and configures AI tools on your system:

- **🧩 VS Code Extensions**: GitHub Copilot, Amazon Q, Continue, Codeium, etc.
- **🔌 MCP Servers**: Claude Code, custom domain tools
- **💻 CLI Tools**: Gemini CLI, cursor CLI, specialized command-line tools
- **🌐 API Services**: Direct connections to AI services

### Intelligent Routing

When you make a request, the system analyzes it and routes to the best available tool:

- **Planning tasks** → Claude MCP (architecture, design)
- **Code completion** → GitHub Copilot (inline suggestions)
- **AWS deployment** → Amazon Q (cloud expertise)
- **Large codebase analysis** → Gemini CLI (large context)

### Adaptive Behavior

The system adapts in real-time:
- If a preferred tool is unavailable, automatically uses alternatives
- Learns from your preferences and feedback
- Monitors tool health and adjusts routing accordingly

## Basic Usage

### Command Palette

Access orchestration features through the Command Palette (`Cmd+Shift+P`):

- **`AI: Plan New Feature`** - Coordinate planning across multiple AI assistants
- **`AI: Intelligent Refactoring`** - Multi-agent code improvement
- **`AI: Design Cloud Deployment`** - Architecture and deployment planning
- **`AI: Multi-Agent Code Review`** - Comprehensive code analysis
- **`AI: Show Discovered Tools`** - View available AI assistants

### Status Bar

The status bar shows orchestration activity:
- **🔍 Discovering...** - Finding available AI tools
- **🧠 Routing...** - Determining best tools for your task
- **⚡ Executing...** - Running tasks on multiple AI assistants
- **✅ Complete** - Task finished successfully

### Automatic Suggestions

The system provides intelligent suggestions based on context:
- Suggests best tool combinations for complex tasks
- Offers alternative approaches when preferred tools are unavailable
- Recommends workflow optimizations based on your patterns

## Workflow Examples

### Example 1: Building a New Feature

**Request**: "Build a user authentication system with JWT tokens"

**Orchestration Flow**:
1. **Claude MCP** plans the architecture and database schema
2. **GitHub Copilot** provides code completion for implementation
3. **Amazon Q** suggests AWS Cognito integration (if AWS is detected in project)
4. **System integrates** all suggestions into a comprehensive solution

**User Experience**:
- Single request yields complete, multi-perspective solution
- Clear explanation of which AI provided what contribution
- Option to accept, modify, or request alternatives

### Example 2: Code Refactoring

**Request**: "Refactor this component to improve performance"

**Orchestration Flow**:
1. **Gemini CLI** analyzes the full codebase context (if available)
2. **Claude MCP** suggests architectural improvements
3. **GitHub Copilot** provides specific code optimizations
4. **System resolves** any conflicting suggestions

**User Experience**:
- Multiple optimization perspectives combined
- Performance impact assessment
- Step-by-step refactoring plan

### Example 3: Deployment Setup

**Request**: "Set up CI/CD pipeline for this Next.js app"

**Orchestration Flow**:
1. **Amazon Q** provides AWS deployment strategy (if AWS Toolkit installed)
2. **Claude MCP** designs CI/CD workflow structure
3. **GitHub Copilot** generates specific configuration files
4. **System presents** integrated deployment solution

**User Experience**:
- Cloud-specific best practices included
- Complete CI/CD configuration generated
- Documentation and setup instructions provided

## Configuration

### Discovery Settings

Control which tools the system looks for:

```json
{
  "aiOrchestration.discovery": {
    "enableAutoDiscovery": true,
    "scanPorts": [3001, 3002, 3003, 8080],
    "extensionWhitelist": ["GitHub.copilot", "AmazonWebServices.aws-toolkit-vscode"],
    "discoveryInterval": 300000
  }
}
```

### Routing Preferences

Customize how tasks are routed:

```json
{
  "aiOrchestration.routing": {
    "preferredTools": {
      "planning": ["claude", "gemini"],
      "completion": ["copilot", "codeium"],
      "deployment": ["amazon-q", "claude"]
    },
    "fallbackBehavior": "graceful",
    "parallelismLevel": "aggressive"
  }
}
```

### User Experience

Control interface and behavior:

```json
{
  "aiOrchestration.user": {
    "allowFallbacks": true,
    "requireConfirmation": false,
    "showRoutingExplanations": true,
    "autoAcceptSingleTool": true
  }
}
```

## Understanding Routing Decisions

### Routing Explanations

When routing explanations are enabled, you'll see clear information about orchestration decisions:

```
Task: "Implement user authentication"
Primary Tool: Claude MCP
Reason: Best suited for architectural planning and multi-file implementation
Supporting: GitHub Copilot (code completion), Amazon Q (AWS integration)
Degraded Mode: No (all preferred tools available)
```

### Tool Selection Factors

The system considers:
- **Capability Match**: How well the tool's abilities fit the task
- **User Preferences**: Your historical choices and explicit preferences
- **Performance History**: Response time and quality metrics
- **Context Relevance**: Project type, languages, frameworks used
- **Tool Health**: Current availability and responsiveness

### Manual Override

You can always override orchestration decisions:
- Click "Choose Different Tools" in routing explanations
- Use tool-specific commands when you want direct control
- Set persistent preferences for specific task types

## Troubleshooting

### No Tools Discovered

**Issue**: System reports no AI tools found

**Solutions**:
- Ensure AI extensions are installed and active
- Check that MCP servers are running (try `claude mcp` for Claude)
- Verify CLI tools are in your PATH
- Check the discovery settings and whitelist

### Tool Not Responding

**Issue**: Specific AI tool becomes unavailable

**System Response**:
- Automatically routes to alternative tools
- Shows notification about adaptation
- Continues with available tools

**User Action**:
- Check tool-specific status (extension enabled, server running, etc.)
- Review tool health in discovery results
- Restart VS Code if needed

### Unexpected Routing

**Issue**: Tasks routed to unexpected tools

**Solutions**:
- Review routing explanations to understand the decision
- Check your preference settings
- Verify tool capabilities in discovery results
- Provide feedback to improve future routing

### Performance Issues

**Issue**: Orchestration feels slow

**Solutions**:
- Reduce parallelism level in settings
- Disable underperforming tools
- Check network connectivity for API-based tools
- Clear orchestration cache if available

## Advanced Features

### Workflow Templates

Create reusable orchestration patterns:

```json
{
  "name": "Full Stack Feature",
  "description": "Complete feature implementation from planning to deployment",
  "steps": [
    { "type": "planning", "tools": ["claude"], "parallel": false },
    { "type": "implementation", "tools": ["copilot", "claude"], "parallel": true },
    { "type": "testing", "tools": ["claude"], "parallel": false },
    { "type": "deployment", "tools": ["amazon-q"], "parallel": false }
  ]
}
```

### Custom Integrations

Add your own AI tools by:
1. Implementing a tool connector
2. Registering with the discovery system
3. Defining capabilities and preferences

### Team Collaboration

Share orchestration patterns with your team:
- Export/import orchestration preferences
- Share custom workflow templates
- Collaborate on tool evaluation and selection

## Privacy and Security

### Data Handling

- Each AI tool processes data according to its own privacy policy
- No cross-tool data sharing without explicit user consent
- Local orchestration logic doesn't send data externally

### Authentication

- Credentials stored securely in VS Code's secret storage
- Per-tool authentication with minimal necessary privileges
- Support for enterprise SSO where available

### Enterprise Considerations

- Tool usage can be monitored and audited
- Policies can restrict which tools are available
- Custom tools can be added for proprietary AI systems

## Getting Help

### Built-in Help

- Use `AI: Show Help` command for context-sensitive assistance
- Check discovery results for tool status and capabilities
- Review routing explanations to understand orchestration decisions

### Feedback and Improvement

The system learns from your usage:
- Provide feedback on routing decisions
- Rate the quality of integrated responses
- Report issues with specific tool integrations

### Community and Support

- GitHub repository for issues and feature requests
- Documentation and examples for custom integrations
- Community discussions on orchestration patterns and best practices

---

**Remember**: The AI Orchestration system is designed to be intelligent and adaptive. The more you use it, the better it becomes at understanding your preferences and providing optimal tool coordination for your development workflow.