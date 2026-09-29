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
  UseGuards,
} from '@nestjs/common';

import {
  ApproveKnowledgeItemDtoSchema,
  DeleteKnowledgeItemDtoSchema,
  EditKnowledgeItemDtoSchema,
  ListKnowledgeItemsDtoSchema,
  RecordKnowledgeItemDtoSchema,
  RejectKnowledgeItemDtoSchema,
  WorkspaceApi,
  type ApproveKnowledgeItemDto,
  type CallerDto,
  type DeleteKnowledgeItemDto,
  type EditKnowledgeItemDto,
  type KnowledgeItemDto,
  type KnowledgeItemPageDto,
  type ListKnowledgeItemsDto,
  type RecordKnowledgeItemDto,
  type RejectKnowledgeItemDto,
} from '@intentra/contracts/workspace';

import { ActorGuard, CurrentCaller } from '../auth/index.js';

@Controller('workspaces/:workspaceId/projects/:projectId/knowledge')
@UseGuards(ActorGuard)
export class KnowledgeController {
  constructor(@Inject(WorkspaceApi) private readonly workspace: WorkspaceApi) {}

  @Post()
  public async record(
    @CurrentCaller() caller: CallerDto,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body({ schema: RecordKnowledgeItemDtoSchema })
    data: RecordKnowledgeItemDto,
  ): Promise<KnowledgeItemDto> {
    return this.workspace.knowledge.record(
      caller,
      workspaceId,
      projectId,
      data,
    );
  }

  @Get()
  public async list(
    @CurrentCaller() caller: CallerDto,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Query({ schema: ListKnowledgeItemsDtoSchema })
    query: ListKnowledgeItemsDto,
  ): Promise<KnowledgeItemPageDto> {
    return this.workspace.knowledge.list(caller, workspaceId, projectId, query);
  }

  @Get(':key')
  public async get(
    @CurrentCaller() caller: CallerDto,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('key') key: string,
  ): Promise<KnowledgeItemDto> {
    return this.workspace.knowledge.get(caller, workspaceId, projectId, key);
  }

  @Patch(':key')
  public async edit(
    @CurrentCaller() caller: CallerDto,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('key') key: string,
    @Body({ schema: EditKnowledgeItemDtoSchema }) data: EditKnowledgeItemDto,
  ): Promise<KnowledgeItemDto> {
    return this.workspace.knowledge.edit(
      caller,
      workspaceId,
      projectId,
      key,
      data,
    );
  }

  @Delete(':key')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(
    @CurrentCaller() caller: CallerDto,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('key') key: string,
    @Body({ schema: DeleteKnowledgeItemDtoSchema })
    data: DeleteKnowledgeItemDto,
  ): Promise<void> {
    return this.workspace.knowledge.delete(
      caller,
      workspaceId,
      projectId,
      key,
      data,
    );
  }

  @Post(':key/approve')
  @HttpCode(HttpStatus.OK)
  public async approve(
    @CurrentCaller() caller: CallerDto,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('key') key: string,
    @Body({ schema: ApproveKnowledgeItemDtoSchema })
    data: ApproveKnowledgeItemDto,
  ): Promise<KnowledgeItemDto> {
    return this.workspace.knowledge.approve(
      caller,
      workspaceId,
      projectId,
      key,
      data,
    );
  }

  @Post(':key/reject')
  @HttpCode(HttpStatus.OK)
  public async reject(
    @CurrentCaller() caller: CallerDto,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('key') key: string,
    @Body({ schema: RejectKnowledgeItemDtoSchema })
    data: RejectKnowledgeItemDto,
  ): Promise<KnowledgeItemDto> {
    return this.workspace.knowledge.reject(
      caller,
      workspaceId,
      projectId,
      key,
      data,
    );
  }
}
