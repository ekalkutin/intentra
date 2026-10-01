import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type {
  CreateWorkspaceDto,
  DeleteWorkspaceDto,
  WorkspaceDto,
  WorkspacesApi,
} from '@intentra/contracts/workspace';
import { AccountId, UnitOfWork, WorkspaceId } from '@intentra/shared-kernel';

import {
  WorkspaceCreationService,
  WorkspaceDeletionService,
} from '../../domain/services/index.js';
import { MemberStatus } from '../../domain/value-objects/index.js';
import { AccessResolver } from '../access/index.js';
import { toWorkspaceDto } from '../mappers/index.js';
import {
  Cleanup,
  MemberRepository,
  WorkspaceRepository,
} from '../ports/outbound/index.js';

@Injectable()
export class WorkspacesService implements WorkspacesApi {
  readonly #workspaceCreationService = new WorkspaceCreationService();
  readonly #workspaceDeletionService = new WorkspaceDeletionService();

  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly accessResolver: AccessResolver,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly memberRepository: MemberRepository,
    private readonly cleanup: Cleanup,
  ) {}

  public async create(
    actor: Actor,
    data: CreateWorkspaceDto,
  ): Promise<WorkspaceDto> {
    const { workspace, owner } = this.#workspaceCreationService.create({
      name: data.name,
      slug: data.slug,
      accountId: actor.accountId,
      email: actor.email,
      ownerName: actor.name,
    });

    await this.unitOfWork.run(async () => {
      await this.workspaceRepository.save(workspace);
      await this.memberRepository.save(owner);
    });

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

  public async delete(
    actor: Actor,
    workspaceId: string,
    data: DeleteWorkspaceDto,
  ): Promise<void> {
    const id = new WorkspaceId(workspaceId);

    await this.unitOfWork.run(async () => {
      await this.workspaceRepository.lock(id);
      const owner = await this.accessResolver.resolve(actor, id);
      const workspace = await this.workspaceRepository.getOne({ id });

      this.#workspaceDeletionService.ensureDeletable(workspace, owner, {
        slug: data.slug,
      });
      await this.workspaceRepository.delete(id);
      await this.cleanup.afterWorkspaceDeleted(id);
    });
  }
}
