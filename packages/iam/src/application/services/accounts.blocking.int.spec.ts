import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import type { Actor } from '@intentra/contracts/iam';
import { TestingApp } from '@intentra/platform-testing';
import {
  AccountId,
  Email,
  NotPlatformAdminException,
} from '@intentra/shared-kernel';

import {
  AccountBlockedException,
  PlatformAdminNotBlockableException,
} from '../../domain/exceptions/index.js';
import { IamModule } from '../../iam.module.js';
import { AccountRepository } from '../ports/outbound/index.js';

import { AccountsService } from './accounts.service.js';
import { AuthService } from './auth.service.js';

const admin: Actor = {
  accountId: new AccountId().value,
  email: 'admin@example.com',
  name: 'Grace Hopper',
  isPlatformAdmin: true,
};

/** Signing up is closed until a Platform Admin opens it; these Accounts are invited. */
const INVITED = { invited: true };
describe('Blocking Accounts', () => {
  let app: TestingApp;

  const ada = {
    name: 'Ada',
    email: 'ada@example.com',
    password: 'correct-horse-battery-staple',
  };

  beforeAll(async () => {
    app = await TestingApp.create({
      imports: [
        IamModule.register({
          accessTokenSecret: 'test-access-secret',
          refreshTokenSecret: 'test-refresh-secret',
          accessTokenTtlSeconds: 900,
          refreshTokenTtlSeconds: 604800,
        }),
      ],
    });
  });

  afterEach(() => app.clearDatabase());

  afterAll(() => app?.close());

  async function adaId(): Promise<string> {
    const account = await app
      .get(AccountRepository)
      .getOne({ email: new Email(ada.email) });

    return account.id.value;
  }

  it('lists every Account by email for a Platform Admin', async () => {
    // Arrange
    await app
      .get(AuthService)
      .register(
        { name: 'Bob', email: 'bob@example.com', password: ada.password },
        INVITED,
      );
    await app.get(AuthService).register(ada, INVITED);

    // Act
    const accounts = await app.get(AccountsService).list(admin);

    // Assert
    expect(accounts).toEqual([
      expect.objectContaining({ email: 'ada@example.com', isBlocked: false }),
      expect.objectContaining({ email: 'bob@example.com', isBlocked: false }),
    ]);
  });

  it('keeps a blocked Account from signing in and refreshing', async () => {
    // Arrange
    await app.get(AuthService).register(ada, INVITED);
    const { refreshToken } = await app.get(AuthService).signIn(ada);

    // Act
    await app.get(AccountsService).block(admin, await adaId());

    // Assert
    await expect(app.get(AuthService).signIn(ada)).rejects.toBeInstanceOf(
      AccountBlockedException,
    );
    await expect(
      app.get(AuthService).refresh({ refreshToken }),
    ).rejects.toBeInstanceOf(AccountBlockedException);
  });

  it('lets an unblocked Account sign in again', async () => {
    // Arrange
    await app.get(AuthService).register(ada, INVITED);
    await app.get(AccountsService).block(admin, await adaId());

    // Act
    await app.get(AccountsService).unblock(admin, await adaId());

    // Assert
    await expect(app.get(AuthService).signIn(ada)).resolves.toBeDefined();
  });

  it('never blocks a Platform Admin', async () => {
    // Arrange
    await app.get(AccountsService).syncPlatformAdmin(ada);

    // Act
    const blocking = app.get(AccountsService).block(admin, await adaId());

    // Assert
    await expect(blocking).rejects.toBeInstanceOf(
      PlatformAdminNotBlockableException,
    );
  });

  it('unblocks an Account made the Platform Admin', async () => {
    // Arrange
    await app.get(AuthService).register(ada, INVITED);
    await app.get(AccountsService).block(admin, await adaId());

    // Act
    await app.get(AccountsService).syncPlatformAdmin(ada);

    // Assert
    await expect(app.get(AuthService).signIn(ada)).resolves.toBeDefined();
  });

  it('refuses anyone but a Platform Admin', async () => {
    // Arrange
    await app.get(AuthService).register(ada, INVITED);
    const someone: Actor = { ...admin, isPlatformAdmin: false };

    // Act
    const blocking = app.get(AccountsService).block(someone, await adaId());

    // Assert
    await expect(blocking).rejects.toBeInstanceOf(NotPlatformAdminException);
  });
});
