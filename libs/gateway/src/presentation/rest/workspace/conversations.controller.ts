import type { ServerResponse } from 'node:http';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { pipeUIMessageStreamToResponse } from 'ai';

import type { Actor } from '@intentra/contracts/iam';
import {
  EditConversationDtoSchema,
  ListConversationsDtoSchema,
  SendMessageDtoSchema,
  WorkspaceApi,
  type ConversationDto,
  type ConversationPageDto,
  type ConversationWithMessagesDto,
  type EditConversationDto,
  type ListConversationsDto,
  type SendMessageDto,
} from '@intentra/contracts/workspace';

import { ActorGuard, CurrentActor } from '../auth/index.js';

/**
 * A Member's Conversations with the Orchestrator. The answer to a message is
 * streamed in the AI SDK UI message stream format (server-sent events); what
 * goes wrong before the stream starts is an ordinary JSON error.
 */
@Controller('workspaces/:workspaceId/projects/:projectId/conversations')
@UseGuards(ActorGuard)
export class ConversationsController {
  constructor(@Inject(WorkspaceApi) private readonly workspace: WorkspaceApi) {}

  @Get()
  public async list(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Query({ schema: ListConversationsDtoSchema }) query: ListConversationsDto,
  ): Promise<ConversationPageDto> {
    return this.workspace.conversations.list(
      actor,
      workspaceId,
      projectId,
      query,
    );
  }

  @Get(':conversationId')
  public async get(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('conversationId') conversationId: string,
  ): Promise<ConversationWithMessagesDto> {
    return this.workspace.conversations.get(
      actor,
      workspaceId,
      projectId,
      conversationId,
    );
  }

  @Patch(':conversationId')
  public async edit(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('conversationId') conversationId: string,
    @Body({ schema: EditConversationDtoSchema }) data: EditConversationDto,
  ): Promise<ConversationDto> {
    return this.workspace.conversations.edit(
      actor,
      workspaceId,
      projectId,
      conversationId,
      data,
    );
  }

  @Delete(':conversationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('conversationId') conversationId: string,
  ): Promise<void> {
    await this.workspace.conversations.delete(
      actor,
      workspaceId,
      projectId,
      conversationId,
    );
  }

  @Post(':conversationId/messages')
  public async send(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('conversationId') conversationId: string,
    @Body({ schema: SendMessageDtoSchema }) data: SendMessageDto,
    @Res() res: ServerResponse,
  ): Promise<void> {
    const stream = await this.workspace.conversations.send(
      actor,
      workspaceId,
      projectId,
      conversationId,
      data,
    );
    pipeUIMessageStreamToResponse({ response: res, stream });
  }
}
