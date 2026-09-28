import { HttpStatus } from '@nestjs/common';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { AgentsModule } from '@intentra/agents';
import { GatewayModule } from '@intentra/gateway';
import { IamModule } from '@intentra/iam';
import { TestingApp } from '@intentra/platform-testing';
import { WorkspaceModule } from '@intentra/workspace';

const SIGN_UP_PATH = '/api/iam/auth/sign-up';

describe('POST /api/iam/auth/sign-up', () => {
  let app: TestingApp;

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
            AgentsModule.register({}),
          ],
        }),
      ],
    });
  });

  afterEach(() => app.clearDatabase());

  afterAll(() => app?.close());

  it('registers an account', async () => {
    // Arrange
    const body = {
      email: 'ada@example.com',
      password: 'correct-horse-battery-staple',
    };

    // Act
    const response = app.request().post(SIGN_UP_PATH).send(body);

    // Assert
    await response.expect(HttpStatus.CREATED);
  });

  it('rejects an invalid body', async () => {
    // Arrange
    const body = { email: 'ada@example.com' };

    // Act
    const response = app.request().post(SIGN_UP_PATH).send(body);

    // Assert
    await response
      .expect(HttpStatus.BAD_REQUEST)
      .expect(res => expect(res.body.code).toBe('VALIDATION_FAILED'));
  });

  it('rejects an email that is already registered', async () => {
    // Arrange
    const body = {
      email: 'ada@example.com',
      password: 'correct-horse-battery-staple',
    };
    await app.request().post(SIGN_UP_PATH).send(body);

    // Act
    const response = app.request().post(SIGN_UP_PATH).send(body);

    // Assert
    await response.expect(HttpStatus.CONFLICT).expect(res =>
      expect(res.body).toEqual({
        message: 'An account with this email already exists',
        code: 'ACCOUNT_ALREADY_EXISTS',
        status: HttpStatus.CONFLICT,
        retryable: false,
      }),
    );
  });
});
