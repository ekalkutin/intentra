import type { CreateWorkspaceDto, WorkspaceDto } from './workspace.dto.js';

export abstract class WorkspaceApi {
  abstract create(data: CreateWorkspaceDto): Promise<WorkspaceDto>;
  abstract find(): Promise<WorkspaceDto[]>;
}
