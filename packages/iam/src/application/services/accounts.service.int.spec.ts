import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { TestingApp } from '@intentra/platform-testing';

import { IamModule } from '../../iam.module.js';

import { AccountsService } from './accounts.service.js';
import { AuthService } from './auth.service.js';

describe('AccountsService integration', () => {
  let app: TestingApp;

  const ada = {
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

  async function signIn(credentials: typeof ada) {
    const { accessToken } = await app.get(AuthService).signIn(credentials);

    return app.get(AuthService).authenticate(accessToken);
  }

  it('starts every Account as not a Platform Admin', async () => {
    // Arrange
    await app.get(AuthService).register(ada);

    // Act
    const actor = await signIn(ada);

    // Assert
    expect(actor.isPlatformAdmin).toBe(false);
  });

  describe('syncPlatformAdmin', () => {
    it('creates a missing Account as a Platform Admin', async () => {
      // Act
      await app.get(AccountsService).syncPlatformAdmin(ada);

      // Assert
      expect((await signIn(ada)).isPlatformAdmin).toBe(true);
    });

    it('appoints an existing Account, which keeps its own password', async () => {
      // Arrange
      await app.get(AuthService).register(ada);

      // Act
      await app.get(AccountsService).syncPlatformAdmin({
        email: 'Ada@Example.com',
        password: 'another-password',
      });

      // Assert
      expect((await signIn(ada)).isPlatformAdmin).toBe(true);
    });

    it('dismisses every other Platform Admin', async () => {
      // Arrange
      const bob = { email: 'bob@example.com', password: ada.password };
      await app.get(AccountsService).syncPlatformAdmin(bob);

      // Act
      await app.get(AccountsService).syncPlatformAdmin(ada);

      // Assert
      expect((await signIn(bob)).isPlatformAdmin).toBe(false);
      expect((await signIn(ada)).isPlatformAdmin).toBe(true);
    });

    it('leaves nobody a Platform Admin without credentials', async () => {
      // Arrange
      await app.get(AccountsService).syncPlatformAdmin(ada);

      // Act
      await app.get(AccountsService).syncPlatformAdmin(null);

      // Assert
      expect((await signIn(ada)).isPlatformAdmin).toBe(false);
    });

    it('changes nothing when run again', async () => {
      // Arrange
      await app.get(AccountsService).syncPlatformAdmin(ada);

      // Act
      await app.get(AccountsService).syncPlatformAdmin(ada);

      // Assert
      expect((await signIn(ada)).isPlatformAdmin).toBe(true);
    });
  });
});
