import 'reflect-metadata';

import type { Abstract, ModuleMetadata, Type } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test, type TestingModule } from '@nestjs/testing';
import supertest from 'supertest';

import {
  clearTestingDatabase,
  dropTestingDatabase,
  initTestingDatabase,
  testingDatabaseModule,
} from '../database/index.js';

export class TestingApp {
  private constructor(
    private readonly moduleRef: TestingModule,
    private readonly http: NestExpressApplication,
  ) {}

  public static async create(metadata: ModuleMetadata): Promise<TestingApp> {
    const moduleRef = await Test.createTestingModule({
      ...metadata,
      imports: [testingDatabaseModule(), ...(metadata.imports ?? [])],
    }).compile();

    const http = moduleRef.createNestApplication<NestExpressApplication>();
    await http.init();
    await initTestingDatabase(moduleRef);

    return new TestingApp(moduleRef, http);
  }

  public get<T>(token: Type<T> | Abstract<T>): T {
    return this.moduleRef.get(token);
  }

  public request(): supertest.Agent {
    return supertest(this.http.getHttpServer());
  }

  public clearDatabase(): Promise<void> {
    return clearTestingDatabase(this.moduleRef);
  }

  public async close(): Promise<void> {
    await dropTestingDatabase(this.moduleRef);
    await this.http.close();
  }
}
