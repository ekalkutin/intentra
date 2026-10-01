import {
  Inject,
  Injectable,
  type OnApplicationBootstrap,
} from '@nestjs/common';

import { AccountsService } from '../../../application/services/index.js';
import {
  IAM_OPTIONS,
  type IamModuleOptions,
} from '../../../iam.module-defs.js';

/** As the server starts, makes the Account named in its configuration the only Platform Admin. */
@Injectable()
export class PlatformAdminBootstrap implements OnApplicationBootstrap {
  constructor(
    @Inject(IAM_OPTIONS) private readonly options: IamModuleOptions,
    private readonly accountsService: AccountsService,
  ) {}

  public async onApplicationBootstrap(): Promise<void> {
    await this.accountsService.syncPlatformAdmin(
      this.options.platformAdmin ?? null,
    );
  }
}
