import { HttpStatus } from '@nestjs/common';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { GatewayModule } from '@intentra/gateway';
import { IamModule } from '@intentra/iam';
import { TestingApp } from '@intentra/platform-testing';
import { WorkspaceModule } from '@intentra/workspace';

import { setOpenSignUp, signUp } from './support/sign-up.js';

const SIGN_UP_PATH = '/api/iam/auth/sign-up';
const SIGN_IN_PATH = '/api/iam/auth/sign-in';
const ME_PATH = '/api/iam/me';
const OPEN_SIGN_UP_PATH = '/api/platform/sign-up';
const PASSWORD = 'correct-horse-battery-staple';

describe('POST /api/iam/auth/sign-up', () => {
  let app: TestingApp;
  /** The Platform Admin's; an access token keeps working after its Account is cleared away. */
  let admin: string;

  const adminCredentials = {
    email: 'admin@example.com',
    name: 'Grace Hopper',
    password: PASSWORD,
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
              platformAdmin: adminCredentials,
            }),
            WorkspaceModule.register({}),
          ],
        }),
      ],
    });
    const signedIn = await app
      .request()
      .post(SIGN_IN_PATH)
      .send(adminCredentials)
      .expect(HttpStatus.OK);
    admin = `Bearer ${signedIn.body.accessToken}`;
  });

  afterEach(() => app.clearDatabase());

  afterAll(() => app?.close());

  const ada = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: PASSWORD,
  };

  async function signIn(email: string): Promise<string> {
    const response = await app
      .request()
      .post(SIGN_IN_PATH)
      .send({ email, password: PASSWORD })
      .expect(HttpStatus.OK);

    return `Bearer ${response.body.accessToken}`;
  }

  describe('while Open Sign-up is on', () => {
    it('registers an Account with its name', async () => {
      // Arrange
      await setOpenSignUp(app, true);

      // Act
      const response = await app.request().post(SIGN_UP_PATH).send(ada);

      // Assert
      expect(response.status).toBe(HttpStatus.CREATED);
      const signedIn = await signIn(ada.email);
      const me = await app
        .request()
        .get(ME_PATH)
        .set('Authorization', signedIn)
        .expect(HttpStatus.OK);
      expect(me.body).toEqual({
        accountId: expect.any(String),
        email: ada.email,
        name: 'Ada Lovelace',
        isPlatformAdmin: false,
      });
    });

    it('rejects a body without a name', async () => {
      // Arrange
      await setOpenSignUp(app, true);

      // Act
      const response = await app
        .request()
        .post(SIGN_UP_PATH)
        .send({ email: ada.email, password: PASSWORD });

      // Assert
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.code).toBe('VALIDATION_FAILED');
    });

    it('rejects a blank name', async () => {
      // Arrange
      await setOpenSignUp(app, true);

      // Act
      const response = await app
        .request()
        .post(SIGN_UP_PATH)
        .send({ ...ada, name: '   ' });

      // Assert
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.code).toBe('INVALID_PERSON_NAME');
    });

    it('rejects an email that is already registered', async () => {
      // Arrange
      await signUp(app, ada);

      // Act
      const response = await app.request().post(SIGN_UP_PATH).send(ada);

      // Assert
      expect(response.status).toBe(HttpStatus.CONFLICT);
      expect(response.body).toEqual({
        message: 'An account with this email already exists',
        code: 'ACCOUNT_ALREADY_EXISTS',
        status: HttpStatus.CONFLICT,
        retryable: false,
      });
    });
  });

  describe('while Open Sign-up is off', () => {
    it('refuses an email nobody invited', async () => {
      // Act
      const response = await app.request().post(SIGN_UP_PATH).send(ada);

      // Assert
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      expect(response.body.code).toBe('SIGN_UP_CLOSED');
    });

    it('lets in an email with a pending Invitation', async () => {
      // Arrange
      await signUp(app, ada);
      const owner = await signIn(ada.email);
      const workspace = await app
        .request()
        .post('/api/workspaces')
        .set('Authorization', owner)
        .send({ name: 'Acme', slug: 'acme' })
        .expect(HttpStatus.CREATED);
      await app
        .request()
        .post(`/api/workspaces/${workspace.body.id}/invitations`)
        .set('Authorization', owner)
        .send({ email: 'bob@example.com' })
        .expect(HttpStatus.CREATED);
      await setOpenSignUp(app, false);

      // Act
      const response = await app
        .request()
        .post(SIGN_UP_PATH)
        .send({ name: 'Bob', email: 'bob@example.com', password: PASSWORD });

      // Assert
      expect(response.status).toBe(HttpStatus.CREATED);
    });
  });

  describe('the switch', () => {
    it('is off until a Platform Admin turns it on', async () => {
      // Act
      const turnedOn = await app
        .request()
        .put(OPEN_SIGN_UP_PATH)
        .set('Authorization', admin)
        .send({ open: true });

      // Assert
      expect(turnedOn.body).toEqual({ open: true });
      await app
        .request()
        .post(SIGN_UP_PATH)
        .send(ada)
        .expect(HttpStatus.CREATED);
    });

    it('is left to a Platform Admin', async () => {
      // Arrange
      await signUp(app, ada);
      const signedIn = await signIn(ada.email);

      // Act
      const response = await app
        .request()
        .put(OPEN_SIGN_UP_PATH)
        .set('Authorization', signedIn)
        .send({ open: true });

      // Assert
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });
  });

  describe('PATCH /api/iam/me', () => {
    it('renames the Account, and its Members show the new name at once', async () => {
      // Arrange
      await signUp(app, ada);
      const owner = await signIn(ada.email);
      const workspace = await app
        .request()
        .post('/api/workspaces')
        .set('Authorization', owner)
        .send({ name: 'Acme', slug: 'acme' })
        .expect(HttpStatus.CREATED);

      // Act
      const renamed = await app
        .request()
        .patch(ME_PATH)
        .set('Authorization', owner)
        .send({ name: 'Ada King' });

      // Assert
      expect(renamed.body.name).toBe('Ada King');
      const members = await app
        .request()
        .get(`/api/workspaces/${workspace.body.id}/members`)
        .set('Authorization', owner)
        .expect(HttpStatus.OK);
      expect(members.body).toEqual([
        expect.objectContaining({ email: ada.email, name: 'Ada King' }),
      ]);
    });
  });
});
