# Mastra для пользовательских агентов Intentra

> Исследовано: 2026-09-21  
> Статус: технический вывод для обсуждения MVP; не меняет PRD или план работ.  
> Метод: документация Mastra; навигация начата с [Mastra llms.txt](https://mastra.ai/llms.txt). Все ссылки ниже — первоисточники Mastra.

## Короткий вывод

Mastra технически подходит для **настраиваемых агентных профилей**, включая «путеводитель по продукту» и агент с ограниченными действиями во внешней системе. Но безопасный продуктовый слой нельзя свести к полям конструктора `Agent`: Intentra должна сама владеть версиями, доступами, секретами, approval и аудитом.

Для MVP целесообразны два режима:

1. **Product Guide** — пользователь задаёт роль и инструкции; агент получает только версионно закреплённый, разрешённый контекст Intentra (например, PRD/Glossary/ADR) и возвращает ответ с citations. Без внешних credentials и без write-инструментов.
2. **Connected Operator** — пользователь выбирает заранее зарегистрированное интеграционное подключение и набор *предопределённых* действий, например `get_service_status`, `restart_staging_service`, `create_deployment_proposal`. Рискованные действия требуют approval. Это не «введи IP и агент сделает что угодно».

Последнее — важная граница: IP-адрес не задаёт ни безопасный канал, ни идентичность, ни допустимые операции. Давать LLM произвольный адрес, произвольную команду или исполняемый пользовательский TypeScript означает открыть SSRF/RCE и обход governance. Рекомендация — подключение через предварительно проверенный HTTPS API/MCP либо изолированный connector/runner, с allowlist хостов и серверными credential references. Это архитектурный вывод из модели Mastra tools/MCP и её мер безопасности, а не готовая бизнес-функция фреймворка. [MCP security](https://mastra.ai/docs/connections/mcp#security), [tools](https://mastra.ai/docs/agents/tools).

## Что Mastra уже даёт

| Потребность Intentra | Возможность Mastra | Следствие для продукта |
| --- | --- | --- |
| Конфигурируемый агент | `Agent` принимает ID, имя, system instructions и model; инструкции, модель, tools, memory, subagents и workflows могут разрешаться из `RequestContext` во время запуска. [Agents](https://mastra.ai/docs/agents/overview), [Request context](https://mastra.ai/docs/server/request-context#accessing-values-with-agents) | Постоянный domain object `AgentDefinition` можно компилировать в один runtime-agent с request-scoped конфигурацией. |
| Создание и редактура конфигурации пользователем | Stored agents имеют draft/latest/published/historical lifecycle, immutable config snapshots, явную публикацию и восстановление старой версии как нового draft. [Stored-agent lifecycle](https://mastra.ai/reference/editor/versioning#database-lifecycle) | Использовать как runtime-опцию, но Intentra всё равно ведёт свой собственный `AgentDefinitionVersion`, ownership и audit. |
| Tools | Tool — schema-validated функция с `id`, description, input/output schema и `execute`; у runtime есть request/tracing context и abort signal. Hooks могут журналировать или отменять конкретный call. [Tools](https://mastra.ai/docs/agents/tools), [tool hooks](https://mastra.ai/docs/agents/tools#run-logic-around-tool-calls) | Пользователь выбирает только tool из каталога Intentra. Реализацию tool пишет платформа; tool вызывает application use case или connector, а не БД напрямую. |
| Внешние MCP-сервисы | `MCPClient` получает tools/resources/prompts внешнего MCP; `MCPServer` может публиковать Mastra agents/tools/workflows/resources. [MCP](https://mastra.ai/docs/connections/mcp) | Для внешней системы предпочтителен approved MCP/API connector; public MCP Intentra остаётся отдельным gateway из PRD. |
| Per-user credentials | Static MCP tools используют общую конфигурацию, runtime toolsets поддерживают конфигурацию и credentials, которые меняются per request. [Static vs runtime tools](https://mastra.ai/docs/connections/mcp#static-and-runtime-tools) | Credential reference разрешается сервером на запуске; его значение не хранится в agent definition или prompt. |
| Approval | Mastra может остановить tool до выполнения и затем принять approve/decline; pending run можно восстановить из storage. MCP client также допускает approval для всех или выбранных tools. [Agent HITL](https://mastra.ai/docs/agents/human-in-the-loop), [MCP tool approval](https://mastra.ai/docs/connections/mcp#tool-approval) | Intentra создаёт свой `ApprovalRequest` и policy decision; Mastra выполняет suspension/resume как адаптер. |
| Контекст и knowledge | Semantic recall — RAG по сообщениям, выключен по умолчанию, требует vector store и embedder; working memory может быть resource- или thread-scoped. [Semantic recall](https://mastra.ai/docs/memory/semantic-recall), [Working memory](https://mastra.ai/docs/memory/working-memory) | Это память разговора, не источник истины продукта. PRD и другие артефакты поставляются отдельным Intentra context resolver с точной версией и citations. |
| Наблюдаемость | Trace включает agent run, LLM calls, tool executions и memory operations; trace context можно связать с OpenTelemetry. [Tracing](https://mastra.ai/docs/observability/tracing/overview#what-gets-traced), [OTel propagation](https://mastra.ai/docs/observability/tracing/overview#opentelemetry-integration) | Связывать Mastra trace с `AgentRun.correlationId`, но audit/business events писать в Intentra. |
| Runtime workflows | Dynamic workflows принимают JSON definition, валидируют её до регистрации, могут persist в storage; definition с тем же ID заменяется для новых runs, а начатые используют старый graph. [Dynamic workflows](https://mastra.ai/docs/workflows/dynamic-workflows) | Сильная основа для будущего visual workflow builder, но не первая версия Custom Agents. |

## Предлагаемая граница ответственности

```text
Intentra domain                         Mastra adapter
──────────────────────────────────     ─────────────────────────────
AgentDefinition / AgentVersion    ──▶  stored or dynamic Agent config
ContextPolicy + pinned artifacts  ──▶  instructions / requestContext
CapabilityGrant                   ──▶  enabled toolset / MCP toolset
CredentialReference               ──▶  server-side token injection
ApprovalRequest / policy          ──▶  requireApproval + suspend/resume
AgentRun + immutable audit        ◀──  trace, tool-call and result metadata
```

`AgentVersion` Intentra должна хранить неизменяемый снимок минимум следующих полей: `role/name`, instructions, model policy, output schema version, `ContextPolicy`, approved `CapabilityGrant` IDs, approval policy, budget/timeout/stop policy и trigger policy. Run фиксирует ID этой версии, caller/effective permissions, context baseline, resolved toolset, approval records, output artifact references и correlation ID.

Mastra dynamic workflow replacement сам по себе не является достаточным governance: у него одна текущая definition по ID, а фреймворк не обязан быть источником бизнес-истории Intentra. Новые runs используют обновлённый graph, старые — исходный; persistence требует совместимого storage adapter. [Dynamic workflows](https://mastra.ai/docs/workflows/dynamic-workflows#replace-a-workflow), [persistence](https://mastra.ai/docs/workflows/dynamic-workflows#persist-definitions).

## Два пользовательских сценария

### 1. Product Guide на основе PRD

**MVP-форма:** name, goal/instructions, project, выбранные типы knowledge (`approved PRD`, `Glossary`, `ADR`, `Specification`), ответная схема и language/model policy. На запуске context resolver подставляет исключительно разрешённые immutable artifact versions; агент обязан возвращать claim с artifact/version citation.

Не включать в этот режим Mastra working memory как «знание проекта»: working memory — изменяемый агентом scratchpad, а semantic recall сохраняет и затем ищет user/assistant/tool messages. [Working memory](https://mastra.ai/docs/memory/working-memory#how-it-works), [semantic recall behaviour](https://mastra.ai/docs/memory/semantic-recall#how-semantic-recall-works). Это полезно для отдельной conversation continuity при явной scope policy, но не заменяет version-pinned PRD.

### 2. Agent для подключённого сервера

В MVP пользователь создаёт `ServerConnection` у Integration Manager: endpoint/host allowlist, environment (`staging` только), authentication reference, каталог доступных действий и owner. Затем при создании агента он выбирает connection и scopes; агент не получает raw secret и не может менять endpoint в prompt.

Каждое действие — конкретный schema-validated tool, например:

- `read_service_health(service)` — read-only, без approval;
- `propose_restart(service, rationale)` — создаёт proposal;
- `restart_staging_service(service)` — только после approval, idempotency key, timeout и audit.

Mastra поддерживает Authorization headers/OAuth для MCP подключения, но его собственная документация прямо требует для untrusted URL `allowedHosts`, называет tool responses untrusted model input и предлагает `requireToolApproval` для sensitive tools. Для stdio subprocess можно передать только явно перечисленные env vars через `inheritDefaultEnv: false`. [MCP connection](https://mastra.ai/docs/connections/mcp#connect-to-mcp-servers), [MCP security](https://mastra.ai/docs/connections/mcp#security).

## Security и эксплуатационные ограничения

- **Секреты.** Mastra показывает примеры tokens в env/header config; это не vault и не продуктовая модель rotation/audit. Intentra должна резолвить encrypted credential reference только внутри connector, redacting values из prompt, streams, traces и экспортов. Mastra по умолчанию redacts API keys, system prompts и tool definitions из HTTP stream chunks, но это дополнительный защитный слой, не замена vault. [MCP connection](https://mastra.ai/docs/connections/mcp#connect-to-mcp-servers), [stream redaction](https://mastra.ai/docs/agents/guardrails#output-processors).
- **Untrusted content.** Tool/MCP results и импортированный PRD могут содержать prompt injection. Mastra советует sanitize content processors; Intentra до передачи контекста применяет provenance, classification и content policy из PRD. [MCP security](https://mastra.ai/docs/connections/mcp#security), [processors](https://mastra.ai/docs/agents/guardrails).
- **Guardrails/budget.** `TokenCostControl` умеет предупреждать/блокировать по оценочной стоимости, но данные observability сохраняются асинхронно и быстрый agent может ненадолго выйти за лимит. Нужны также жёсткие Intentra limits до запуска и на число tool calls/egress. [Token cost limitation](https://mastra.ai/docs/agents/guardrails#enforce-cost-limits).
- **Authorization.** Fine-grained authorization — отдельная Enterprise capability Mastra; если не настроить FGA, проверки пропускаются. Authorization Intentra не должна зависеть от этой опции: проверять tenant/project/artifact/capability до вызова Mastra и повторно в каждом tool executor. [Mastra FGA](https://mastra.ai/docs/auth/fga).
- **Continuity.** Обычный `agent.stream()` не переживает замену server process. Для восстановления нужны durable runs/shared persistent storage и idempotent tools; multi-replica recovery пока не использует distributed lease. [Deployment and recovery](https://mastra.ai/docs/deployment/mastra-server#graceful-shutdown-and-rolling-deploys).
- **Sandbox не снимает policy.** Mastra предлагает ephemeral sandboxes также для multi-tenant untrusted code, но у них provider-enforced runtime caps и expiry. Это будущий изолированный execution tier, не оправдание выполнения arbitrary server commands в MVP. [Sandbox deployment](https://mastra.ai/docs/deployment/sandbox).

## Рекомендуемый scope

### Добавить в MVP

1. Единый Agent Runtime data model уже сейчас: `AgentDefinition`, immutable `AgentVersion`, `AgentRun`, `ContextPolicy`, `CapabilityGrant`, `ApprovalRequest`, `CredentialReference`.
2. UI создания **Product Guide** с context source = selected, approved, pinned Intentra artifacts; output = answer + citations; tools = Intentra read-only knowledge/search only.
3. Один controlled **Connected Operator** vertical slice: staging-only connector, один-два action tools, approval for every write, scoped short-lived credential и полный audit.
4. Adapter, который собирает Mastra agent и per-run dynamic toolset из уже проверенных domain grants; no direct database access from tools.
5. Trace-to-run correlation, structured output validation и cancellation/timeout/budget enforcement.

### Отложить

- свободное выполнение shell/TypeScript, arbitrary IP/URL и arbitrary MCP stdio command;
- пользовательский workflow builder: dynamic workflows дают фундамент, но требуют dependency registry, permissions (`stored-workflows:*`, `workflows:execute`) и самостоятельного revision/review layer. [Dynamic workflow management](https://mastra.ai/docs/workflows/dynamic-workflows#manage-definitions-over-http);
- autonomous production access, persistent broad credentials, event/schedule triggers без per-run policy и limits;
- разрешение агенту approve свои actions либо publish/approve Intentra artifacts.

## Решения, которые нужны до реализации

1. В MVP пользовательский агент — только Project Guide, или включаем и один staging operator connector?
2. Какой первый boundary для сервера: MCP, HTTPS API, SSH через isolated runner, либо существующий internal service connector? Для MVP безопаснее API/MCP, чем SSH.
3. Какие project artifacts считаются доступными Guide по умолчанию, и может ли он читать draft/restricted evidence?
4. Кто имеет право создать connection, включить write capability и одобрить действие: Project Admin, Integration Manager, отдельный reviewer?
5. Какая версия PRD является baseline для run и как показывать пользователю, что ответ собран по уже superseded версии?
