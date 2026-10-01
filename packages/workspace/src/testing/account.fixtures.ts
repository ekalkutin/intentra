import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import type { Actor } from '@intentra/contracts/iam';
import type { TestingApp } from '@intentra/platform-testing';
import { AccountId } from '@intentra/shared-kernel';

import { AccountNameModel } from '../subdomains/tenancy/infrastructure/database/index.js';

/**
 * An Account as IAM would have made it, and its Actor: a Member always has
 * one, and reads its name from it. Named after its email unless told.
 */
export async function givenAccount(
  app: TestingApp,
  email = 'ada@example.com',
  name = email.slice(0, email.indexOf('@')),
): Promise<Actor> {
  const actor: Actor = {
    accountId: new AccountId().value,
    email,
    name,
    isPlatformAdmin: false,
  };
  await app
    .get<Model<AccountNameModel>>(getModelToken(AccountNameModel.name))
    .create({ _id: actor.accountId, name });

  return actor;
}
