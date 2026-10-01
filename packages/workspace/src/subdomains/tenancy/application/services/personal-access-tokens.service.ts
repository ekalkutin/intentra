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

import {
  AccessPolicyService,
  PersonalAccessTokenCreationService,
  PersonalAccessTokenRevocationService,
} from '../../domain/services/index.js';
import {
  MemberStatus,
  PersonalAccessTokenId,
  PersonalAccessTokenSecretHash,
} from '../../domain/value-objects/index.js';
import { AccessResolver } from '../access/index.js';
import { InvalidPersonalAccessTokenException } from '../exceptions/index.js';
import { toPersonalAccessTokenDto } from '../mappers/index.js';
import {
  MemberRepository,
  PersonalAccessTokenRepository,
  PersonalAccessTokenSecrets,
  WorkspaceRepository,
} from '../ports/outbound/index.js';

@Injectable()
export class PersonalAccessTokensService implements PersonalAccessTokensApi {
  readonly #accessPolicyService = new AccessPolicyService();
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
    const { secret, hash, hint } = this.personalAccessTokenSecrets.issue();

    return this.unitOfWork.run(async () => {
      await this.workspaceRepository.lock(id);
      const creator = await this.accessResolver.resolveForChange(actor, id);
      const workspace = await this.workspaceRepository.getOne({ id });

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
      await this.personalAccessTokenRepository.save(token);

      return { token: toPersonalAccessTokenDto(token, creator), secret };
    });
  }

  public async list(
    actor: Actor,
    workspaceId: string,
  ): Promise<PersonalAccessTokenDto[]> {
    const id = new WorkspaceId(workspaceId);
    const member = await this.accessResolver.resolve(actor, id);

    const tokens = await this.personalAccessTokenRepository.findMany({
      workspaceId: id,
      ...(!this.#accessPolicyService.canSeeAllPersonalAccessTokens(member) && {
        memberId: member.id,
      }),
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
      const workspace = await this.workspaceRepository.getOne({ id });
      const token = await this.personalAccessTokenRepository.getOne({
        id: new PersonalAccessTokenId(tokenId),
        workspaceId: id,
      });

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
      // No AI works with a suspended Workspace, external agents included.
      const workspace = await this.workspaceRepository.getOne({
        id: token.workspaceId,
      });
      workspace.ensureChangeable();

      token.markUsed();
      await this.personalAccessTokenRepository.save(token);

      return {
        // An external agent never acts as a Platform Admin.
        actor: {
          accountId: member.accountId.value,
          email: member.email.value,
          name: member.name.value,
          isPlatformAdmin: false,
        },
        workspaceId: token.workspaceId.value,
        level: token.level.value as ProjectRoleDto,
      };
    });
  }
}
