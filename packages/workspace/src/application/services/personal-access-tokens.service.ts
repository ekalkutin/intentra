import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type {
  CreatedPersonalAccessTokenDto,
  CreatePersonalAccessTokenDto,
  PersonalAccessTokenCallerDto,
  PersonalAccessTokenDto,
  PersonalAccessTokensApi,
  ProjectRoleDto,
} from '@intentra/contracts/workspace';
import { UnitOfWork, WorkspaceId } from '@intentra/shared-kernel';

import { Workspace } from '../../domain/entities/index.js';
import {
  PersonalAccessTokenCreationService,
  PersonalAccessTokenRevocationService,
} from '../../domain/services/index.js';
import {
  MemberStatus,
  PersonalAccessTokenId,
  PersonalAccessTokenSecretHash,
} from '../../domain/value-objects/index.js';
import { AccessResolver } from '../access/index.js';
import {
  InvalidPersonalAccessTokenException,
  PersonalAccessTokenNotFoundException,
  WorkspaceNotFoundException,
} from '../exceptions/index.js';
import { toPersonalAccessTokenDto } from '../mappers/index.js';
import {
  MemberRepository,
  PersonalAccessTokenRepository,
  PersonalAccessTokenSecrets,
  WorkspaceRepository,
} from '../ports/outbound/index.js';

@Injectable()
export class PersonalAccessTokensService implements PersonalAccessTokensApi {
  readonly #personalAccessTokenCreationService =
    new PersonalAccessTokenCreationService();
  readonly #personalAccessTokenRevocationService =
    new PersonalAccessTokenRevocationService();

  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly accessResolver: AccessResolver,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly memberRepository: MemberRepository,
    private readonly personalAccessTokenRepository: PersonalAccessTokenRepository,
    private readonly personalAccessTokenSecrets: PersonalAccessTokenSecrets,
  ) {}

  public async create(
    actor: Actor,
    workspaceId: string,
    data: CreatePersonalAccessTokenDto,
  ): Promise<CreatedPersonalAccessTokenDto> {
    const id = new WorkspaceId(workspaceId);
    const creator = await this.accessResolver.resolve(actor, id);
    const workspace = await this.getWorkspace(id);
    const { secret, hash, hint } = this.personalAccessTokenSecrets.issue();

    const token = this.#personalAccessTokenCreationService.create(
      workspace,
      creator,
      {
        name: data.name,
        level: data.level,
        secretHash: hash,
        secretHint: hint,
        lifetimeDays: data.lifetimeDays,
      },
    );
    await this.unitOfWork.run(() =>
      this.personalAccessTokenRepository.save(token),
    );

    return { token: toPersonalAccessTokenDto(token, creator), secret };
  }

  public async list(
    actor: Actor,
    workspaceId: string,
  ): Promise<PersonalAccessTokenDto[]> {
    const id = new WorkspaceId(workspaceId);
    const member = await this.accessResolver.resolve(actor, id);

    const tokens = await this.personalAccessTokenRepository.findMany({
      workspaceId: id,
      ...(!member.isOwner() && { memberId: member.id }),
    });
    const members = await this.memberRepository.findMany({
      workspaceId: id,
      status: MemberStatus.Active,
    });

    return tokens.flatMap(token => {
      const creator = members.find(candidate =>
        candidate.id.equals(token.memberId),
      );

      return creator ? [toPersonalAccessTokenDto(token, creator)] : [];
    });
  }

  public async revoke(
    actor: Actor,
    workspaceId: string,
    tokenId: string,
  ): Promise<void> {
    const id = new WorkspaceId(workspaceId);
    const revoker = await this.accessResolver.resolve(actor, id);

    await this.unitOfWork.run(async () => {
      const workspace = await this.getWorkspace(id);
      const token = await this.personalAccessTokenRepository.findOne({
        id: new PersonalAccessTokenId(tokenId),
        workspaceId: id,
      });
      if (!token) {
        throw new PersonalAccessTokenNotFoundException();
      }

      this.#personalAccessTokenRevocationService.ensureRevocable(
        workspace,
        revoker,
        token,
      );
      await this.personalAccessTokenRepository.delete(token.id);
    });
  }

  public async authenticate(
    secret: string,
  ): Promise<PersonalAccessTokenCallerDto> {
    return this.unitOfWork.run(async () => {
      const token = await this.personalAccessTokenRepository.findOne({
        secretHash: new PersonalAccessTokenSecretHash(
          this.personalAccessTokenSecrets.hash(secret),
        ),
      });
      if (!token || token.isExpired()) {
        throw new InvalidPersonalAccessTokenException();
      }
      const member = await this.memberRepository.findOne({
        id: token.memberId,
        workspaceId: token.workspaceId,
        status: MemberStatus.Active,
      });
      if (!member) {
        throw new InvalidPersonalAccessTokenException();
      }

      token.markUsed();
      await this.personalAccessTokenRepository.save(token);

      return {
        actor: { accountId: member.accountId.value, email: member.email.value },
        workspaceId: token.workspaceId.value,
        level: token.level.value as ProjectRoleDto,
      };
    });
  }

  private async getWorkspace(id: WorkspaceId): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({ id });
    if (!workspace) {
      throw new WorkspaceNotFoundException();
    }

    return workspace;
  }
}
