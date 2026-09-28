import { randomUUID } from 'node:crypto';

import type { DynamicModule } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import type { Connection } from 'mongoose';
import { inject } from 'vitest';

import './provided-context.js';

export function testingDatabaseModule(): DynamicModule {
  return MongooseModule.forRoot(inject('databaseUri'), {
    dbName: randomUUID(),
  });
}

export async function initTestingDatabase(
  moduleRef: TestingModule,
): Promise<void> {
  const connection = moduleRef.get<Connection>(getConnectionToken());
  await Promise.all(
    Object.values(connection.models).map(model => model.init()),
  );
}

export async function clearTestingDatabase(
  moduleRef: TestingModule,
): Promise<void> {
  const connection = moduleRef.get<Connection>(getConnectionToken());
  await Promise.all(
    Object.values(connection.collections).map(collection =>
      collection.deleteMany({}),
    ),
  );
}

export async function dropTestingDatabase(
  moduleRef: TestingModule,
): Promise<void> {
  await moduleRef.get<Connection>(getConnectionToken()).dropDatabase();
}
