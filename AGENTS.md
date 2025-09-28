# Repository Guidelines

## Project Structure & Module Organization
- `test-copilot-extension/src` holds the TypeScript source for the experimental orchestration VS Code extension; compiled output lands in `test-copilot-extension/out`.
- Strategic plans and protocol notes live at the repository root (`ARCHITECTURE.md`, `ROADMAP.md`, `ACP-INTEGRATION.md`)—reference them before proposing new behaviors.
- Scenario assets are grouped under `examples/` (`extension-connectors`, `mcp-connectors`, `workflows`); reuse these JSON workflows when documenting or testing agent flows.
- Reference material for users and integrators is in `docs/` (`user-guide.md`, `integration-guide.md`, `api-reference.md`). Update them alongside feature work.

## Build, Test, and Development Commands
- `cd test-copilot-extension && npm install` installs the VS Code extension toolchain.
- `npm run compile` transpiles TypeScript to `out/extension.js`; run before committing TypeScript changes.
- `npm run watch` keeps the compiler active while iterating locally.
- Launch the extension via VS Code "Run Extension" task to validate orchestration flows end-to-end.

## Coding Style & Naming Conventions
- Stick to TypeScript `strict`-friendly patterns, 4-space indentation, and descriptive function names (`triggerSuggestion`, `provideInlineCompletionItems`).
- Prefer early returns for guard clauses and wrap potentially failing VS Code calls in `try/catch` with surfaced messages.
- Introduce configuration constants in `src/` modules rather than scattering string literals across workflow assets.

## Testing Guidelines
- Smoke-test commands (`testCopilot.triggerSuggestion`) through the VS Code Extension Development Host after each change.
- Add automated coverage with `@vscode/test-electron` when introducing complex flows; co-locate test files under `test-copilot-extension/src/__tests__` using `<feature>.spec.ts`.
- Record expected agent orchestration scenarios as JSON in `examples/workflows/` and keep them in sync with docs.

## Commit & Pull Request Guidelines
- Follow the concise, present-tense style already in history (e.g., `Add Agent Context Protocol integration strategy`).
- Each PR should explain the orchestration problem solved, note affected docs/examples, and link to relevant issues or planning docs.
- Attach screenshots or short screencasts when UI behaviors in VS Code change; include replication steps for manual reviewers.
- Ensure linting/compilation passes locally and reference the commands you ran in the PR description.
