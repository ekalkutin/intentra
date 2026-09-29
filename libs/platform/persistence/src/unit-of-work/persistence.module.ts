import { Global, Module } from '@nestjs/common';

import { UnitOfWork } from '@intentra/shared-kernel';

import { MongooseUnitOfWork } from './mongoose-unit-of-work.js';

@Global()
@Module({
  providers: [
    MongooseUnitOfWork,
    { provide: UnitOfWork, useExisting: MongooseUnitOfWork },
  ],
  exports: [MongooseUnitOfWork, UnitOfWork],
})
export class PersistenceModule {}
