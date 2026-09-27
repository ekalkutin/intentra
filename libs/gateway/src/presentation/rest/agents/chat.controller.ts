import type { ServerResponse } from 'node:http';
import { Readable } from 'node:stream';
import type { ReadableStream as NodeReadableStream } from 'node:stream/web';

import { Body, Controller, Inject, Param, Post, Res } from '@nestjs/common';
import { UI_MESSAGE_STREAM_HEADERS } from 'ai';

import {
  AgentsApi,
  ChatRequestDtoSchema,
  type ChatRequestDto,
} from '@intentra/contracts/agents';

import {
  CurrentAccount,
  WorkspaceMembership,
  type AuthenticatedAccount,
} from '../../auth/index.js';

/**
 * The chat with the orchestrator of a workspace, in the AI SDK UI protocol:
 * `useChat` sends the whole conversation, the answer streams back.
 */
@Controller({
  path: '/workspaces/:workspaceId/chat',
})
export class ChatController {
  constructor(
    @Inject(AgentsApi)
    private readonly agents: AgentsApi,

    @Inject(WorkspaceMembership)
    private readonly membership: WorkspaceMembership,
  ) {}

  @Post()
  public async stream(
    @CurrentAccount() account: AuthenticatedAccount,
    @Param('workspaceId') workspaceId: string,
    @Body({ schema: ChatRequestDtoSchema }) request: ChatRequestDto,
    @Res() response: ServerResponse,
  ): Promise<void> {
    await this.membership.assert(account.id, workspaceId);

    // The person closed the tab or pressed stop: the models stop too.
    const abort = new AbortController();
    response.on('close', () => {
      if (!response.writableFinished) abort.abort();
    });

    // What fails before the answer starts (no key) fails here, as JSON.
    const stream = await this.agents.chat.stream({
      workspaceId,
      accountId: account.id,
      request,
      abortSignal: abort.signal,
    });

    response.writeHead(200, {
      ...UI_MESSAGE_STREAM_HEADERS,
      'x-accel-buffering': 'no',
    });
    // The contract speaks the web stream type of the DOM lib; Node's is the same object.
    Readable.fromWeb(stream as NodeReadableStream<Uint8Array>).pipe(response);
  }
}
