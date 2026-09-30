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
  ApproveKnowledgeItemsDtoSchema,
  ConfirmKnowledgeItemDtoSchema,
  DeleteKnowledgeItemDtoSchema,
  EditKnowledgeItemDtoSchema,
  ListKnowledgeItemsDtoSchema,
  RecordKnowledgeItemDtoSchema,
  RejectKnowledgeItemDtoSchema,
  RetireKnowledgeItemDtoSchema,
  WorkspaceApi,
  type ApproveKnowledgeItemDto,
  type ApproveKnowledgeItemsDto,
  type CallerDto,
  type ConfirmKnowledgeItemDto,
  type DeleteKnowledgeItemDto,
  type EditKnowledgeItemDto,
  type KnowledgeDependenciesDto,
  type KnowledgeItemDto,
  type KnowledgeItemPageDto,
  type KnowledgeSummaryDto,
  type ListKnowledgeItemsDto,
  type RecordKnowledgeItemDto,
  type RejectKnowledgeItemDto,
  type RetireKnowledgeItemDto,
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

  // Declared before `:key`, which would otherwise take `summary` for a Knowledge Key.
  @Get('summary')
  public async summary(
    @CurrentCaller() caller: CallerDto,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
  ): Promise<KnowledgeSummaryDto> {
    return this.workspace.knowledge.summary(caller, workspaceId, projectId);
  }

  @Post('approve')
  @HttpCode(HttpStatus.OK)
  public async approveTogether(
    @CurrentCaller() caller: CallerDto,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body({ schema: ApproveKnowledgeItemsDtoSchema })
    data: ApproveKnowledgeItemsDto,
  ): Promise<KnowledgeItemDto[]> {
    return this.workspace.knowledge.approveTogether(
      caller,
      workspaceId,
      projectId,
      data,
    );
  }

  @Get(':key/dependencies')
  public async dependencies(
    @CurrentCaller() caller: CallerDto,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('key') key: string,
  ): Promise<KnowledgeDependenciesDto> {
    return this.workspace.knowledge.dependencies(
      caller,
      workspaceId,
      projectId,
      key,
    );
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

  @Post(':key/retire')
  @HttpCode(HttpStatus.OK)
  public async retire(
    @CurrentCaller() caller: CallerDto,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('key') key: string,
    @Body({ schema: RetireKnowledgeItemDtoSchema })
    data: RetireKnowledgeItemDto,
  ): Promise<KnowledgeItemDto> {
    return this.workspace.knowledge.retire(
      caller,
      workspaceId,
      projectId,
      key,
      data,
    );
  }

  @Post(':key/confirm')
  @HttpCode(HttpStatus.OK)
  public async confirm(
    @CurrentCaller() caller: CallerDto,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('key') key: string,
    @Body({ schema: ConfirmKnowledgeItemDtoSchema })
    data: ConfirmKnowledgeItemDto,
  ): Promise<KnowledgeItemDto> {
    return this.workspace.knowledge.confirm(
      caller,
      workspaceId,
      projectId,
      key,
      data,
    );
  }
}
