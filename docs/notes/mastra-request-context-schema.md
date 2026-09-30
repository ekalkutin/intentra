# Контекст вызова tools: Mastra `requestContextSchema`

Статус: решено (2026-09-30), `requestContextSchema` подошёл. Общая схема: `libs/agent-toolkit/src/tool-context.ts` (`toolContextSchema`: `apis`, `caller: CallerDto`, `workspaceId`); MCP-хендлер кладёт их в `RequestContext`. С 2026-09-30 `apis` — только нужные tools sub-API (`ToolApis`: `knowledge`, `projects`, `access`), а не весь `WorkspaceApi`: Orchestrator из подобласти Agents сам входит в `WorkspaceApi` (Agents ADR 0002). `caller.agent` — `{ kind, level, projectId }`.

Что выяснилось на практике (`@mastra/core@1.71.0`):

- внутри `execute` `requestContext` обязателен и типизирован по схеме: `requestContext.get('caller')` без проверок на `undefined`, свои хелперы не нужны;
- Mastra подменяет значения результатом разбора: `z.object` срезает лишние поля, поэтому схема описывает объект целиком, а `apis` — через `z.custom<ToolApis>()` (приходит той же ссылкой);
- неверный контекст — `{ error: true, message }` (ValidationError), а исключение из `execute` пробрасывается как есть: MCP-переходник отдаёт агенту `isError` с `CODE: message`;
- tool с типизированным контекстом попадает в `MCP_TOOLS` (`satisfies ToolsInput`) и в переходник (`Tool<any, …>` на все семь параметров).

## Вопрос

Tool из `libs/agent-toolkit` должен знать:

- **кто вызывает** — человек, от лица которого действует агент (из PAT в MCP, из JWT у собственных агентов);
- **через что работать** — опубликованные API контекстов (`ToolApis`: `iam`, `workspace`, `agents`).

MCP-хендлер (`libs/gateway/src/presentation/mcp/mcp.handler.ts`) кладёт в Mastra `RequestContext` `apis` и `caller` (`PersonalAccessTokenCallerDto`: `actor`, `workspaceId`, `level` из PAT). Tools контекст пока не читают.

## Что попробовать первым

У Mastra `createTool` есть `requestContextSchema` — zod-схема контекста запроса:

- Mastra проверяет контекст по схеме до `execute`; при ошибке tool возвращает `{ error: true, message }`, а не бросает исключение;
- `context.requestContext.get(...)` внутри `execute` типизирован по схеме;
- одну общую схему можно держать в `agent-toolkit` и подключать во все tools.

Документация: https://mastra.ai/reference/tools/create-tool, https://mastra.ai/docs/server/request-context

## Что проверить

- Tool с типизированным контекстом должен по-прежнему попадать в `MCP_TOOLS` / `AGENT_TOOLS` и в переходник `libs/gateway/src/presentation/mcp/mcp-tools.ts`. Mastra `RequestContext<T>` инвариантен: типизированный контекст нельзя передать туда, где ждут `RequestContext<unknown>`.
- Как положить в схему `ToolApis` (объекты сервисов, а не данные) — например, через `z.custom<ToolApis>()`.

## Правила

- Пользователя брать только из контекста, никогда из input tool (так же советует документация Mastra).
- Свои хелперы (`ToolContext`, `createToolContext` / `readToolContext`) писать, только если `requestContextSchema` не подойдёт. Такие хелперы уже были сделаны и убраны как лишняя абстракция: они передавали пустой контекст, а у Mastra, возможно, есть готовое решение.

## Когда решать

С первым tool, которому нужны данные (PAT-авторизация в MCP уже есть).
