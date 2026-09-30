import type { ServerResponse } from 'node:http';

import {
  Body,
  Controller,
  Inject,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import {
  ChatRequestDtoSchema,
  WorkspaceApi,
  type ChatRequestDto,
} from '@intentra/contracts/workspace';

import { ActorGuard, CurrentActor } from '../rest/auth/index.js';
import { ProjectNotFoundException } from '../rest/errors/index.js';

import { ChatHandler } from './chat.handler.js';

/**
 * A Conversation with the Orchestrator in one Project. Stateless: the client
 * sends the whole Conversation each time and gets the answer as server-sent
 * events (`ChatEventDto`). What goes wrong before the stream starts is an
 * ordinary JSON error.
 */
@Controller('workspaces/:workspaceId/projects/:projectId/chat')
@UseGuards(ActorGuard)
export class ChatController {
  constructor(
    @Inject(WorkspaceApi) private readonly workspace: WorkspaceApi,
    private readonly chatHandler: ChatHandler,
  ) {}

  @Post()
  public async chat(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body({ schema: ChatRequestDtoSchema }) data: ChatRequestDto,
    @Res() res: ServerResponse,
  ): Promise<void> {
    // An outsider gets the Workspace's 404 here.
    const access = await this.workspace.access.get(actor, workspaceId);
    const projects = await this.workspace.projects.list(actor, workspaceId);
    const project = projects.find(({ id }) => id === projectId);
    const projectAccess = access.projects[projectId];
    if (!project || !projectAccess) {
      throw new ProjectNotFoundException();
    }

    await this.chatHandler.handle(
      {
        actor,
        workspaceId,
        project: {
          id: project.id,
          name: project.name,
          role: projectAccess.role,
        },
      },
      data.messages,
      res,
    );
  }
}
