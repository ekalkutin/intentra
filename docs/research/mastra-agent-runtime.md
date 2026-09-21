# Mastra для Agent Runtime Intentra

> Дата исследования: 2026-09-21  
> Статус: рекомендация для технического дизайна, не решение об интерфейсах

## Вывод

Mastra подходит как **внутренний execution engine** для bounded context `Agent Runtime` Intentra. Он не должен становиться доменной моделью Intentra и не должен напрямую владеть PRD, requirements, RBAC, secrets, approvals или audit records.

`Agent Definition`, `Agent Version`, `Agent Run`, `Context Policy`, `Capability Grant`, `Approval Request`, `Run Budget` и `Evaluation Suite` — понятия Intentra. Mastra Agent, Workflow, Tool, Memory и MCP client/server — детали адаптера, которые реализуют запуск.

## Подтверждённые возможности Mastra

Официальный индекс Mastra перечисляет документацию для Agents, Tools, structured output, Human-in-the-Loop и Guardrails; Workflows с состоянием, snapshots, suspend/resume, Human-in-the-Loop и error handling; Memory; Subagents и Skills; MCP, A2A и ACP; server adapters/request context; authentication/fine-grained authorization; traces, metrics и evals. Это покрывает технические потребности внутреннего agent execution слоя Intentra. [Mastra llms.txt](https://mastra.ai/llms.txt)

Релевантные первоисточники:

- [Agents and tools](https://mastra.ai/docs/agents/tools.md)
- [Structured output](https://mastra.ai/docs/agents/structured-output.md)
- [Human-in-the-loop](https://mastra.ai/docs/agents/human-in-the-loop.md)
- [Guardrails](https://mastra.ai/docs/agents/guardrails.md)
- [Workflows: state, snapshots и suspend/resume](https://mastra.ai/docs/workflows/workflow-state.md)
- [Mastra MCP connection](https://mastra.ai/docs/connections/mcp.md)
- [Memory](https://mastra.ai/docs/memory/working-memory.md)
- [Tracing](https://mastra.ai/docs/observability/tracing/overview.md)
- [Evals: gates and verdicts](https://mastra.ai/docs/evals/gates-and-verdicts.md)

## Рекомендуемое размещение

```text
Agent Runtime (Intentra domain)
├── Agent Studio
│   ├── AgentDefinition / AgentVersion
│   ├── Prompt and output-schema policy
│   ├── ContextPolicy
│   ├── CapabilityGrant
│   └── EvaluationSuite
├── Execution
│   ├── AgentRun / RunStep / RunBudget
│   ├── ApprovalRequest
│   └── ExecutionLog
└── ports
    ├── AgentExecutionEngine
    ├── ToolExecutor
    ├── ContextResolver
    ├── MemoryStore
    └── RunTelemetry

libs/adapters/mastra
├── MastraAgentExecutionEngine
├── MastraWorkflowFactory
├── MastraToolAdapter
├── MastraMemoryAdapter
└── MastraTelemetryAdapter
```

`Integration Hub` по-прежнему владеет публичным MCP Server Intentra и внешними MCP connections. Agent Runtime может попросить Integration Hub предоставить scoped external MCP tool, но не создаёт клиентские grants и не реализует public MCP policy.

## Граница, которую нельзя нарушать

1. API Intentra создаёт `AgentRun` и фиксирует `context baseline` **до** вызова Mastra.
2. Адаптер собирает конкретный Mastra Agent/Workflow из immutable `AgentVersion` и разрешённых capabilities.
3. Domain tools — тонкие адаптеры к application use cases Intentra. Они не дают Mastra прямой доступ к базе данных.
4. Structured output адаптера маппится на Intentra `Proposal`, `Claim`, `SpecificationDraft` и т. п.; переход в `approved` всегда выполняет доменный approval workflow.
5. Raw telemetry Mastra связывается с `AgentRun`, но audit событие и бизнес-результат записывает Intentra.

## Что заложить уже в MVP

- Один `AgentDefinition`/`AgentVersion` data model, даже если UI позволяет лишь три system templates.
- Versioned output schemas для Discovery, Spec Writer и Architect.
- `ContextPolicy`: разрешённые artifact types, их состояния, версии и максимальный размер контекста.
- `CapabilityGrant`: allowlist внутренних tools и external MCP servers, без secrets в definition.
- `ApprovalPolicy`: agent может создавать только draft/proposal; never approve.
- `AgentRun` с `requestedByPrincipal`, `effectiveScopes`, `baseline`, `model binding`, `tool calls`, `cost/usage placeholder` и correlation ID.
- Минимальный eval dataset и quality gate на структурированный output до публикации результата в review queue.

## Не делать

- Не хранить Mastra Agent ID как единственный идентификатор бизнес-агента.
- Не выдавать Mastra процессу суперпользовательский доступ к БД или vault.
- Не превращать Mastra memory в source of truth проекта: долгосрочные знания остаются в Evidence, Product Definition и Traceability.
- Не публиковать public MCP Server «как есть» из Mastra без Intentra authentication, tenant/project policy, version pinning и audit.
- Не разрешать пользователю исполнять произвольный TypeScript/prompt/tool bundle без versioning, review и capability policy.
