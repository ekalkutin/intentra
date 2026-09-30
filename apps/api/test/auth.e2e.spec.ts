import { HttpStatus } from '@nestjs/common';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { GatewayModule } from '@intentra/gateway';
import { IamModule } from '@intentra/iam';
import { TestingApp } from '@intentra/platform-testing';
import { WorkspaceModule } from '@intentra/workspace';

const SIGN_UP_PATH = '/api/iam/auth/sign-up';
const SIGN_IN_PATH = '/api/iam/auth/sign-in';
const REFRESH_PATH = '/api/iam/auth/refresh';
const ME_PATH = '/api/iam/me';

describe('IAM authentication', () => {
  let app: TestingApp;

  const credentials = {
    email: 'ada@example.com',
    password: 'correct-horse-battery-staple',
  };

  beforeAll(async () => {
    app = await TestingApp.create({
      imports: [
        GatewayModule.register({
          contexts: [
            IamModule.register({
              accessTokenSecret: 'test-access-secret',
              refreshTokenSecret: 'test-refresh-secret',
              accessTokenTtlSeconds: 900,
              refreshTokenTtlSeconds: 604800,
            }),
            WorkspaceModule.register({}),
          ],
        }),
      ],
    });
  });

  afterEach(() => app.clearDatabase());

  afterAll(() => app?.close());

  async function signUpAndIn(): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    await app.request().post(SIGN_UP_PATH).send(credentials);
    const response = await app
      .request()
      .post(SIGN_IN_PATH)
      .send(credentials)
      .expect(HttpStatus.OK);

    return response.body;
  }

  describe('POST /api/iam/auth/sign-in', () => {
    it('returns a token pair', async () => {
      // Arrange
      await app.request().post(SIGN_UP_PATH).send(credentials);

      // Act
      const response = app.request().post(SIGN_IN_PATH).send(credentials);

      // Assert
      await response.expect(HttpStatus.OK).expect(res => {
        expect(res.body.accessToken).toEqual(expect.any(String));
        expect(res.body.refreshToken).toEqual(expect.any(String));
      });
    });

    it('rejects a wrong password', async () => {
      // Arrange
      await app.request().post(SIGN_UP_PATH).send(credentials);

      // Act
      const response = app
        .request()
        .post(SIGN_IN_PATH)
        .send({ ...credentials, password: 'wrong-password' });

      // Assert
      await response
        .expect(HttpStatus.UNAUTHORIZED)
        .expect(res => expect(res.body.code).toBe('INVALID_CREDENTIALS'));
    });
  });

  describe('POST /api/iam/auth/refresh', () => {
    it('returns a new token pair', async () => {
      // Arrange
      const { refreshToken } = await signUpAndIn();

      // Act
      const response = app.request().post(REFRESH_PATH).send({ refreshToken });

      // Assert
      await response
        .expect(HttpStatus.OK)
        .expect(res =>
          expect(res.body.accessToken).toEqual(expect.any(String)),
        );
    });

    it('rejects an invalid refresh token', async () => {
      // Arrange
      const body = { refreshToken: 'not-a-jwt' };

      // Act
      const response = app.request().post(REFRESH_PATH).send(body);

      // Assert
      await response
        .expect(HttpStatus.UNAUTHORIZED)
        .expect(res => expect(res.body.code).toBe('INVALID_REFRESH_TOKEN'));
    });
  });

  describe('GET /api/iam/me', () => {
    it('returns the Actor behind the access token', async () => {
      // Arrange
      const { accessToken } = await signUpAndIn();

      // Act
      const response = app
        .request()
        .get(ME_PATH)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      await response.expect(HttpStatus.OK).expect(res =>
        expect(res.body).toEqual({
          accountId: expect.any(String),
          email: credentials.email,
        }),
      );
    });

    it('rejects a request without a token', async () => {
      // Act
      const response = app.request().get(ME_PATH);

      // Assert
      await response
        .expect(HttpStatus.UNAUTHORIZED)
        .expect(res => expect(res.body.code).toBe('UNAUTHENTICATED'));
    });

    it('rejects an invalid token', async () => {
      // Act
      const response = app
        .request()
        .get(ME_PATH)
        .set('Authorization', 'Bearer not-a-jwt');

      // Assert
      await response
        .expect(HttpStatus.UNAUTHORIZED)
        .expect(res => expect(res.body.code).toBe('UNAUTHENTICATED'));
    });
  });
});
