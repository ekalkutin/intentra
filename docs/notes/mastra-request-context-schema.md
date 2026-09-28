# Контекст вызова tools: Mastra `requestContextSchema`

Статус: открытый вопрос (2026-09-29).

## Вопрос

Tool из `libs/agent-toolkit` должен знать:

- **кто вызывает** — человек, от лица которого действует агент (из PAT в MCP, из JWT у собственных агентов);
- **через что работать** — опубликованные API контекстов (`ToolApis`: `iam`, `workspace`, `agents`).

Сейчас MCP-хендлер (`libs/gateway/src/presentation/mcp/mcp.handler.ts`) кладёт в Mastra `RequestContext` только `apis`, пользователя там нет (TODO до появления PAT). Tools контекст пока не читают.

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

Вместе с PAT-авторизацией в MCP и первым tool, которому нужны данные.
