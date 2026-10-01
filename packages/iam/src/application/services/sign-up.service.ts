import { Injectable } from '@nestjs/common';

import type { Actor, OpenSignUpDto, SignUpApi } from '@intentra/contracts/iam';
import { NotPlatformAdminException, UnitOfWork } from '@intentra/shared-kernel';

import { SignUpSettingsRepository } from '../ports/outbound/index.js';

@Injectable()
export class SignUpService implements SignUpApi {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly signUpSettingsRepository: SignUpSettingsRepository,
  ) {}

  public async get(actor: Actor): Promise<OpenSignUpDto> {
    ensurePlatformAdmin(actor);
    const settings = await this.signUpSettingsRepository.getOne();

    return { open: settings.isOpen };
  }

  public async set(actor: Actor, data: OpenSignUpDto): Promise<OpenSignUpDto> {
    ensurePlatformAdmin(actor);

    return this.unitOfWork.run(async () => {
      const settings = await this.signUpSettingsRepository.getOne();
      if (data.open) {
        settings.open();
      } else {
        settings.close();
      }
      await this.signUpSettingsRepository.save(settings);

      return { open: settings.isOpen };
    });
  }
}

function ensurePlatformAdmin(actor: Actor): void {
  if (!actor.isPlatformAdmin) {
    throw new NotPlatformAdminException();
  }
}
