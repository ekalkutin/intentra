import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { APPLICATION_SERVICES, CQRS_HANDLERS } from './application/index.js';
import { IamApiPort, PasswordHasher } from './application/ports/index.js';
import {
  IAM_OPTIONS,
  IamConfigurableModule,
  type IamModuleOptions,
} from './iam.module-defs.js';
import { PasswordHashingService } from './infrastructure/adapters/index.js';
import { PERSISTENCE } from './infrastructure/persistence/index.js';

@Module({
  imports: [CqrsModule],
  providers: [
    ...CQRS_HANDLERS,
    ...PERSISTENCE,
    ...APPLICATION_SERVICES,
    { provide: PasswordHasher, useClass: PasswordHashingService },
    {
      provide: JwtService,
      inject: [IAM_OPTIONS],
      useFactory: (options: IamModuleOptions) =>
        new JwtService({ secret: options.security.jwtSecret }),
    },
  ],
  exports: [IamApiPort],
})
export class IamModule extends IamConfigurableModule {}
