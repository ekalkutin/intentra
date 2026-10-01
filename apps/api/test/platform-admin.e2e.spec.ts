import { HttpStatus } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { GatewayModule } from '@intentra/gateway';
import { IamModule } from '@intentra/iam';
import { TestingApp } from '@intentra/platform-testing';
import { WorkspaceModule } from '@intentra/workspace';

const SIGN_IN_PATH = '/api/iam/auth/sign-in';
const ME_PATH = '/api/iam/me';

describe('Platform Admin from the configuration', () => {
  let app: TestingApp;

  const admin = {
    email: 'admin@example.com',
    name: 'Grace Hopper',
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
              platformAdmin: admin,
            }),
            WorkspaceModule.register({}),
          ],
        }),
      ],
    });
  });

  afterAll(() => app?.close());

  it('signs in with the configured password and is a Platform Admin', async () => {
    // Arrange
    const signedIn = await app
      .request()
      .post(SIGN_IN_PATH)
      .send(admin)
      .expect(HttpStatus.OK);

    // Act
    const response = await app
      .request()
      .get(ME_PATH)
      .set('Authorization', `Bearer ${signedIn.body.accessToken}`);

    // Assert
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      accountId: expect.any(String),
      email: admin.email,
      name: 'Grace Hopper',
      isPlatformAdmin: true,
    });
  });
});
