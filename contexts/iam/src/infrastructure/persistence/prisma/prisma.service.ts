import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import {
  IAM_OPTIONS,
  type IamModuleOptions,
} from '../../../iam.module-defs.js';

import { PrismaClient } from './generated/client/client.js';

export type PrismaTransaction = Omit<
  PrismaClient,
  '$on' | '$connect' | '$disconnect' | '$transaction' | '$extends'
>;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(@Inject(IAM_OPTIONS) options: IamModuleOptions) {
    super({
      adapter: new PrismaPg({
        host: options.database.host,
        port: options.database.port,
        user: options.database.username,
        password: options.database.password,
        database: options.database.name,
      }),
    });
  }

  public async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  public async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
