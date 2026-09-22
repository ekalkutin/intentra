import type { ToolExecutionContext } from '@mastra/core/tools';
import type { Request } from 'express';

import {
  AccountIdentitySchema,
  type AccountIdentity,
} from '@intentra/workspace-contracts';

/**
 * Две половины одного уговора: кто спрашивает, кладётся в запрос у двери и
 * достаётся внутри инструмента.
 *
 * Между ними — движок: HTTP-транспорт MCP переносит `request.auth` в
 * `context.mcp.extra.authInfo` и больше ничего про нас не знает. Поэтому
 * уговор описан здесь целиком, а не разнесён по двери и по инструментам:
 * ключ, форма и разбор — в одном файле, и разъехаться им негде.
 */
const CALLER = 'intentra:caller';

/** `AuthInfo` протокола: движок требует токен, разбирать его не умеет и не должен. */
type RequestWithAuthInfo = Request & {
  auth?: {
    token: string;
    clientId: string;
    scopes: string[];
    extra?: Record<string, unknown>;
  };
};

/**
 * Токен кладётся тот же самый, что пришёл заголовком: поле `AuthInfo.token`
 * обещает access token, и соврать в нём значило бы подставить того, кто
 * однажды включит здесь OAuth. Прав он не даёт — вердикт выносит Workspace.
 */
export function attachCaller(
  request: Request,
  caller: AccountIdentity,
  token: string,
): void {
  (request as RequestWithAuthInfo).auth = {
    token,
    clientId: caller.accountId,
    /* Scopes — часть S8 вместе с `McpClientGrant`. Пока их нет, пустой список
       честнее выдуманного: врать в структуре, по которой потом будут решать. */
    scopes: [],
    extra: { [CALLER]: caller },
  };
}

/**
 * Кто спрашивает, глазами инструмента.
 *
 * Бросает обычную ошибку, а не отказ доступа: инструмент без вызывающего — это
 * неверно собранная дверь, а не чужой запрос. Отказ здесь выглядел бы как
 * проблема вызывающего и скрыл бы ошибку разработчика.
 */
export function callerOf(context: ToolExecutionContext): AccountIdentity {
  const caller = AccountIdentitySchema.safeParse(
    context.mcp?.extra?.authInfo?.extra?.[CALLER],
  );

  if (!caller.success) {
    throw new Error(
      'No caller on the MCP request: this tool must run behind the gateway that verifies the token',
    );
  }

  return caller.data;
}
