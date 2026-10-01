import { getConnectionToken } from '@nestjs/mongoose';
import { mongo, type Connection } from 'mongoose';

import type { TestingApp } from '@intentra/platform-testing';

const SIGN_UP_PATH = '/api/iam/auth/sign-up';

/**
 * Turns Open Sign-up on or off, as a Platform Admin would; it is off until
 * turned on. Written straight to IAM's `sign_up_settings`, since a test
 * cleans the database between cases.
 */
export async function setOpenSignUp(
  app: TestingApp,
  open: boolean,
): Promise<void> {
  await app
    .get<Connection>(getConnectionToken())
    .collection<{ _id: string; open: boolean }>('sign_up_settings')
    .updateOne({ _id: 'sign-up' }, { $set: { open } }, { upsert: true });
}

/** Signs an Account up with Open Sign-up on, named after its email unless a name is given. */
export async function signUp(
  app: TestingApp,
  credentials: {
    readonly email: string;
    readonly password: string;
    readonly name?: string;
  },
) {
  await setOpenSignUp(app, true);

  return app
    .request()
    .post(SIGN_UP_PATH)
    .send({
      name: credentials.email.slice(0, credentials.email.indexOf('@')),
      ...credentials,
    });
}

/**
 * Puts back the Account behind an access token, as IAM had it, after a test
 * cleaned the database: a Member always has its Account.
 */
export async function restoreAccount(
  app: TestingApp,
  authorization: string,
): Promise<void> {
  const token = authorization.replace(/^Bearer /, '');
  const claims = JSON.parse(
    Buffer.from(token.split('.')[1]!, 'base64url').toString(),
  ) as { sub: string; email: string; name: string; platformAdmin: boolean };
  await app
    .get<Connection>(getConnectionToken())
    .collection<{ _id: InstanceType<typeof mongo.UUID> }>('accounts')
    .updateOne(
      { _id: new mongo.UUID(claims.sub) },
      {
        $set: {
          email: claims.email,
          name: claims.name,
          passwordHash: 'restored-in-a-test',
          isPlatformAdmin: claims.platformAdmin,
          isBlocked: false,
        },
      },
      { upsert: true },
    );
}
