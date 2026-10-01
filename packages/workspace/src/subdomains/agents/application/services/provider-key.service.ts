import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type {
  ProviderKeyApi,
  ProviderKeyDto,
  SetProviderKeyDto,
} from '@intentra/contracts/workspace';
import { UnitOfWork, WorkspaceId } from '@intentra/shared-kernel';

import {
  AccessResolver,
  MemberRepository,
  MemberStatus,
  type Member,
} from '../../../tenancy/index.js';
import { ProviderKey } from '../../domain/entities/index.js';
import { ProviderKeyManagementService } from '../../domain/services/index.js';
import { ProviderKeySecret } from '../../domain/value-objects/index.js';
import { ProviderKeyRejectedException } from '../exceptions/index.js';
import { toProviderKeyDto } from '../mappers/index.js';
import {
  ProviderKeyCipher,
  ProviderKeyRepository,
  ProviderKeyVerifier,
} from '../ports/outbound/index.js';

@Injectable()
export class ProviderKeyService implements ProviderKeyApi {
  readonly #providerKeyManagementService = new ProviderKeyManagementService();

  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly accessResolver: AccessResolver,
    private readonly memberRepository: MemberRepository,
    private readonly providerKeyRepository: ProviderKeyRepository,
    private readonly providerKeyCipher: ProviderKeyCipher,
    private readonly providerKeyVerifier: ProviderKeyVerifier,
  ) {}

  public async get(actor: Actor, workspaceId: string): Promise<ProviderKeyDto> {
    const id = new WorkspaceId(workspaceId);
    await this.accessResolver.resolve(actor, id);
    const key = await this.providerKeyRepository.getOne({ workspaceId: id });

    return toProviderKeyDto(key, await this.findAddedBy(key));
  }

  public async set(
    actor: Actor,
    workspaceId: string,
    data: SetProviderKeyDto,
  ): Promise<ProviderKeyDto> {
    const id = new WorkspaceId(workspaceId);
    const secret = new ProviderKeySecret(data.key);
    const owner = await this.accessResolver.resolve(actor, id);
    this.#providerKeyManagementService.ensureCanManage(owner);
    // Asked before the transaction: it is a call over the network.
    if (!(await this.providerKeyVerifier.isAccepted(secret))) {
      throw new ProviderKeyRejectedException();
    }
    const encryptedKey = this.providerKeyCipher.encrypt(secret);

    return this.unitOfWork.run(async () => {
      let key = await this.providerKeyRepository.findOne({ workspaceId: id });
      if (key) {
        key.replace(encryptedKey, secret.hint(), owner.id);
      } else {
        key = ProviderKey.add({
          workspaceId: id.value,
          encryptedKey: encryptedKey.value,
          hint: secret.hint().value,
          addedBy: owner.id.value,
        });
      }
      await this.providerKeyRepository.save(key);

      return toProviderKeyDto(key, owner);
    });
  }

  public async remove(actor: Actor, workspaceId: string): Promise<void> {
    const id = new WorkspaceId(workspaceId);
    const owner = await this.accessResolver.resolve(actor, id);
    this.#providerKeyManagementService.ensureCanManage(owner);

    await this.unitOfWork.run(async () => {
      const key = await this.providerKeyRepository.getOne({ workspaceId: id });
      await this.providerKeyRepository.delete(key.id);
    });
  }

  private findAddedBy(key: ProviderKey): Promise<Member | null> {
    return this.memberRepository.findOne({
      id: key.addedBy,
      workspaceId: key.workspaceId,
      status: MemberStatus.Active,
    });
  }
}
