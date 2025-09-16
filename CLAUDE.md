# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the **AI Orchestration for VS Code** project - an adaptive multi-agent development environment architecture that transforms VS Code into an intelligent orchestration hub for AI coding assistants.

**Current Status**: Research & Design Phase with proof-of-concept implementations.

## Key Architecture Concepts

### Four-Layer Architecture
1. **Dynamic Tool Discovery Engine** - Automatically detects and catalogs AI tools across MCP servers, VS Code extensions, CLI tools, and APIs
2. **Adaptive Task Router** - Intelligently routes tasks based on actual tool availability, capabilities, and performance
3. **Hybrid Integration Layer** - Provides unified interface using multiple connection protocols (MCP, Extension API, CLI, REST)
4. **Orchestration Core** - Coordinates multi-agent task execution and conflict resolution

### Core Design Principles
- **Tool Agnosticism**: Works with any combination of AI tools, no hardcoded assumptions
- **Hybrid Integration**: Supports multiple protocols (MCP servers, VS Code extensions, CLI tools, APIs)
- **Real-time Adaptation**: Dynamically adjusts to tool availability and health changes
- **Capability-based Routing**: Routes tasks based on actual tested capabilities, not assumptions

## Development Commands

### Proof-of-Concept Extension
```bash
# Build and test the VS Code extension
cd test-copilot-extension
npm install
npm run compile
npm run watch  # For development

# Load extension in VS Code for testing
# Use F5 in VS Code or "Debug: Start Debugging"
```

### Documentation
```bash
# Render complete architecture documentation (requires Quarto)
quarto render ai-orchestration-mockup.qmd

# View architecture in any markdown viewer
cat ai-orchestration-mockup.qmd
```

## Key Implementation Areas

### Core Types and Interfaces
The architecture defines several critical interfaces that future implementations must follow:

- `DiscoveredTool` - Represents any AI tool found by the discovery engine
- `ToolConnector` - Abstract base for all tool integration methods
- `RoutingPlan` - Execution plan with primary/supporting tools and fallbacks
- `Task` - Work items routed to appropriate AI tools
- `WorkspaceContext` - VS Code workspace state and metadata

### Tool Integration Patterns
Four distinct integration patterns are supported:

1. **MCP Connector** (`examples/mcp-connectors/`) - For Model Context Protocol servers like Claude Code
2. **VS Code Extension Connector** (`examples/extension-connectors/`) - For extensions like GitHub Copilot, Amazon Q
3. **CLI Connector** - For command-line tools like Gemini CLI
4. **API Connector** - For direct REST API integrations

### Discovery and Routing Logic
The system discovers tools by:
- Scanning VS Code extensions for known AI assistant IDs
- Probing common MCP server ports and configuration files
- Testing CLI command availability
- Reading API service configurations

Tasks are routed based on:
- Tool capability fitness scores
- User preferences and historical choices
- Performance metrics and response times
- Real-time health status

## File Organization

- `ai-orchestration-mockup.qmd` - Complete architecture design with Mermaid diagrams
- `ARCHITECTURE.md` - Technical implementation details
- `test-copilot-extension/` - Working proof-of-concept VS Code extension
- `examples/` - Reference implementations for all connector types
- `docs/` - Integration guide, user guide, and API reference

## Implementation Roadmap Context

**Phase 1 (Current)**: Architecture design and proof-of-concept
**Phase 2**: Core discovery engine implementation
**Phase 3**: Adaptive routing system
**Phase 4**: Tool integration framework
**Phase 5**: User experience layer
**Phase 6**: Advanced features (ML-enhanced routing, workflows)

## Critical Dependencies

The architecture assumes:
- VS Code Extension API for workspace integration
- Model Context Protocol for standardized AI tool communication
- WebSocket/HTTP for MCP server connections
- Node.js spawn for CLI tool execution
- TypeScript for type safety across integration boundaries

When implementing new components, follow the existing connector patterns and ensure compatibility with the adaptive routing system that expects all tools to be health-monitored and capability-tested.