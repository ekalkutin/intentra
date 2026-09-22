import type { MCPServer } from '@mastra/mcp';
import { All, Controller, Inject, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { type AccountIdentity } from '@intentra/workspace-contracts';

import {
  AccountScoped,
  RequestAccount,
} from '../infrastructure/common/decorators/index.js';
import { extractBearerToken } from '../infrastructure/common/http/request.helper.js';
import { attachCaller } from '../infrastructure/mcp/caller.js';
import { MCP_SERVER } from '../infrastructure/mcp/mcp-server.js';

/**
 * Единственная дверь второго фасада.
 *
 * `@AccountScoped()` — потому что адрес не называет workspace: у MCP-клиента
 * один настроенный URL на всё, а workspace выбирается вызовом инструмента.
 * Токен при этом проверяется общим охранником, тем же, что и на REST: второй
 * публичной двери, не знающей про аккаунты, не появляется (ADR 0005).
 */
@AccountScoped()
@Controller('mcp')
export class McpController {
  constructor(@Inject(MCP_SERVER) private readonly server: MCPServer) {}

  /**
   * Весь протокол идёт одним адресом и разными методами, поэтому `@All()`, а
   * ответ пишет движок — отсюда `@Res()` и никакого возвращаемого значения.
   */
  @All()
  public async handle(
    @RequestAccount() caller: AccountIdentity,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    attachCaller(request, caller, extractBearerToken(request) ?? '');

    const url = new URL(
      request.originalUrl,
      `http://${request.headers.host ?? 'localhost'}`,
    );

    await this.server.startHTTP({
      url,
      /* Движок умеет сам сверять путь и отвечать 404. Здесь это лишнее: до
         сюда запрос довёл маршрутизатор, и вторая проверка означала бы только
         одно — что фасад знает про глобальный префикс приложения. */
      httpPath: url.pathname,
      req: request,
      res: response,
      /* Без сессий: состояние сервера пережило бы перезапуск процесса не
         лучше, чем его отсутствие, зато клиент получал бы «session not found»
         вместо обычного переподключения. Инструменты только читают, и слать
         клиенту что-то по своей воле серверу незачем. */
      options: { serverless: true },
    });
  }
}
