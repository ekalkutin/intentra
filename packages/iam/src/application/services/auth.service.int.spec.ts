import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { TestingApp } from '@intentra/platform-testing';

import { IamModule } from '../../iam.module.js';
import { AccountAlreadyExistsException } from '../exceptions/index.js';

import { AuthService } from './auth.service.js';

describe('AuthService integration', () => {
  let app: TestingApp;

  const data = {
    email: 'ada@example.com',
    password: 'correct-horse-battery-staple',
  };

  beforeAll(async () => {
    app = await TestingApp.create({
      imports: [
        IamModule.register({
          accessTokenSecret: 'test-access-secret',
          refreshTokenSecret: 'test-refresh-secret',
        }),
      ],
    });
  });

  afterEach(() => app.clearDatabase());

  afterAll(() => app?.close());

  it('rejects a duplicate email', async () => {
    // Arrange
    const authService = app.get(AuthService);
    await authService.register(data);

    // Act
    const registration = authService.register(data);

    // Assert
    await expect(registration).rejects.toBeInstanceOf(
      AccountAlreadyExistsException,
    );
  });

  it('rejects a duplicate email in a different case', async () => {
    // Arrange
    const authService = app.get(AuthService);
    await authService.register(data);

    // Act
    const registration = authService.register({
      ...data,
      email: data.email.toUpperCase(),
    });

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
      authService.register(data),
      authService.register(data),
    ]);

    // Assert
    const rejected = results.filter(result => result.status === 'rejected');
    expect(rejected).toHaveLength(1);
    expect(rejected[0]?.reason).toBeInstanceOf(AccountAlreadyExistsException);
  });
});
