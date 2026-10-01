import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import type { Actor } from '@intentra/contracts/iam';
import { TestingApp } from '@intentra/platform-testing';
import { AccountId, NotPlatformAdminException } from '@intentra/shared-kernel';

import { SignUpClosedException } from '../../domain/exceptions/index.js';
import { IamModule } from '../../iam.module.js';

import { AccountsService } from './accounts.service.js';
import { AuthService } from './auth.service.js';
import { SignUpService } from './sign-up.service.js';

const admin: Actor = {
  accountId: new AccountId().value,
  email: 'admin@example.com',
  name: 'Grace Hopper',
  isPlatformAdmin: true,
};

const ada = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  password: 'correct-horse-battery-staple',
};

describe('Signing up', () => {
  let app: TestingApp;

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

  async function signIn(): Promise<Actor> {
    const { accessToken } = await app.get(AuthService).signIn(ada);

    return app.get(AuthService).authenticate(accessToken);
  }

  it('is closed to anyone not invited until a Platform Admin opens it', async () => {
    // Act
    const registration = app.get(AuthService).register(ada, { invited: false });

    // Assert
    await expect(registration).rejects.toBeInstanceOf(SignUpClosedException);
    await expect(app.get(SignUpService).get(admin)).resolves.toEqual({
      open: false,
    });
  });

  it('lets an invited email sign up while it is closed', async () => {
    // Act
    await app.get(AuthService).register(ada, { invited: true });

    // Assert
    await expect(signIn()).resolves.toMatchObject({ email: ada.email });
  });

  it('lets anyone sign up once opened', async () => {
    // Arrange
    await app.get(SignUpService).set(admin, { open: true });

    // Act
    await app.get(AuthService).register(ada, { invited: false });

    // Assert
    await expect(signIn()).resolves.toMatchObject({ email: ada.email });
  });

  it('leaves the switch to a Platform Admin', async () => {
    // Act
    const opening = app
      .get(SignUpService)
      .set({ ...admin, isPlatformAdmin: false }, { open: true });

    // Assert
    await expect(opening).rejects.toBeInstanceOf(NotPlatformAdminException);
  });

  describe('the name', () => {
    it('keeps the name given at sign-up, and its owner may change it', async () => {
      // Arrange
      await app.get(AuthService).register(ada, { invited: true });
      const actor = await signIn();

      // Act
      await app.get(AccountsService).editMe(actor, { name: '  Ada King ' });

      // Assert
      await expect(app.get(AccountsService).getMe(actor)).resolves.toEqual({
        ...actor,
        name: 'Ada King',
      });
    });

    it('gives a Platform Admin made from the configuration its configured name', async () => {
      // Arrange
      await app.get(AccountsService).syncPlatformAdmin(ada);

      // Act
      const me = await app.get(AccountsService).getMe(await signIn());

      // Assert
      expect(me.name).toBe('Ada Lovelace');
    });
  });
});
