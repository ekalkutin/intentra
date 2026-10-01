import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { TestingApp } from '@intentra/platform-testing';

import { IamModule } from '../../iam.module.js';
import {
  AccountAlreadyExistsException,
  InvalidCredentialsException,
  InvalidRefreshTokenException,
  UnauthenticatedException,
} from '../exceptions/index.js';

import { AuthService } from './auth.service.js';

/** Signing up is closed until a Platform Admin opens it; these Accounts are invited. */
const INVITED = { invited: true };
describe('AuthService integration', () => {
  let app: TestingApp;

  const data = {
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

  describe('register', () => {
    it('rejects a duplicate email', async () => {
      // Arrange
      const authService = app.get(AuthService);
      await authService.register(data, INVITED);

      // Act
      const registration = authService.register(data, INVITED);

      // Assert
      await expect(registration).rejects.toBeInstanceOf(
        AccountAlreadyExistsException,
      );
    });

    it('rejects a duplicate email in a different case', async () => {
      // Arrange
      const authService = app.get(AuthService);
      await authService.register(data, INVITED);

      // Act
      const registration = authService.register(
        { ...data, email: data.email.toUpperCase() },
        INVITED,
      );

      // Assert
      await expect(registration).rejects.toBeInstanceOf(
        AccountAlreadyExistsException,
      );
    });

    it('rejects concurrent registrations with the same email', async () => {
      // Arrange
      const authService = app.get(AuthService);

      // Act
      const results = await Promise.allSettled([
        authService.register(data, INVITED),
        authService.register(data, INVITED),
      ]);

      // Assert
      const rejected = results.filter(result => result.status === 'rejected');
      expect(rejected).toHaveLength(1);
      expect(rejected[0]?.reason).toBeInstanceOf(AccountAlreadyExistsException);
    });
  });

  describe('signIn', () => {
    it('issues tokens that authenticate the Account', async () => {
      // Arrange
      const authService = app.get(AuthService);
      await authService.register(data, INVITED);

      // Act
      const tokens = await authService.signIn(data);

      // Assert
      const actor = await authService.authenticate(tokens.accessToken);
      expect(actor.email).toBe(data.email);
    });

    it('accepts the email in a different case', async () => {
      // Arrange
      const authService = app.get(AuthService);
      await authService.register(data, INVITED);

      // Act
      const signIn = authService.signIn({
        ...data,
        email: data.email.toUpperCase(),
      });

      // Assert
      await expect(signIn).resolves.toHaveProperty('accessToken');
    });

    it('rejects a wrong password', async () => {
      // Arrange
      const authService = app.get(AuthService);
      await authService.register(data, INVITED);

      // Act
      const signIn = authService.signIn({
        ...data,
        password: 'wrong-password',
      });

      // Assert
      await expect(signIn).rejects.toBeInstanceOf(InvalidCredentialsException);
    });

    it('rejects an unknown email the same way', async () => {
      // Arrange
      const authService = app.get(AuthService);

      // Act
      const signIn = authService.signIn(data);

      // Assert
      await expect(signIn).rejects.toBeInstanceOf(InvalidCredentialsException);
    });
  });

  describe('refresh', () => {
    it('issues a new pair for the same Account', async () => {
      // Arrange
      const authService = app.get(AuthService);
      await authService.register(data, INVITED);
      const { refreshToken } = await authService.signIn(data);

      // Act
      const tokens = await authService.refresh({ refreshToken });

      // Assert
      const actor = await authService.authenticate(tokens.accessToken);
      expect(actor.email).toBe(data.email);
    });

    it('rejects an access token passed as a refresh token', async () => {
      // Arrange
      const authService = app.get(AuthService);
      await authService.register(data, INVITED);
      const { accessToken } = await authService.signIn(data);

      // Act
      const refresh = authService.refresh({ refreshToken: accessToken });

      // Assert
      await expect(refresh).rejects.toBeInstanceOf(
        InvalidRefreshTokenException,
      );
    });

    it('rejects the token of an Account that no longer exists', async () => {
      // Arrange
      const authService = app.get(AuthService);
      await authService.register(data, INVITED);
      const { refreshToken } = await authService.signIn(data);
      await app.clearDatabase();

      // Act
      const refresh = authService.refresh({ refreshToken });

      // Assert
      await expect(refresh).rejects.toBeInstanceOf(
        InvalidRefreshTokenException,
      );
    });
  });

  describe('authenticate', () => {
    it('rejects an invalid access token', async () => {
      // Arrange
      const authService = app.get(AuthService);

      // Act
      const authentication = authService.authenticate('not-a-jwt');

      // Assert
      await expect(authentication).rejects.toBeInstanceOf(
        UnauthenticatedException,
      );
    });
  });
});
