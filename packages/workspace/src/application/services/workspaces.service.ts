import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type {
  CreateWorkspaceDto,
  WorkspaceDto,
  WorkspacesApi,
} from '@intentra/contracts/workspace';
import { AccountId } from '@intentra/shared-kernel';

import { WorkspaceCreationService } from '../../domain/services/index.js';
import { MemberStatus } from '../../domain/value-objects/index.js';
import { toWorkspaceDto } from '../mappers/index.js';
import {
  MemberRepository,
  WorkspaceRepository,
} from '../ports/outbound/index.js';

@Injectable()
export class WorkspacesService implements WorkspacesApi {
  readonly #workspaceCreationService = new WorkspaceCreationService();

  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  public async create(
    actor: Actor,
    data: CreateWorkspaceDto,
  ): Promise<WorkspaceDto> {
    const { workspace, owner } = this.#workspaceCreationService.create({
      name: data.name,
      slug: data.slug,
      accountId: actor.accountId,
    });

    // No transaction yet
    // the Workspace goes first, so a taken slug fails before anything is written.
    await this.workspaceRepository.save(workspace);
    try {
      await this.memberRepository.save(owner);
    } catch (error) {
      await this.workspaceRepository.delete(workspace.id).catch(() => {});
      throw error;
    }

    return toWorkspaceDto(workspace);
  }

  public async list(actor: Actor): Promise<WorkspaceDto[]> {
    const members = await this.memberRepository.findMany({
      accountId: new AccountId(actor.accountId),
      status: MemberStatus.Active,
    });
    const workspaces = await this.workspaceRepository.findMany({
      ids: members.map(member => member.workspaceId),
    });

    return workspaces.map(toWorkspaceDto);
  }
}
