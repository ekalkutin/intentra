import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import type { Actor } from '@intentra/contracts/iam';
import { TestingApp } from '@intentra/platform-testing';
import { AccountId, UnitOfWork } from '@intentra/shared-kernel';

import { WorkspaceModule } from '../../../../workspace.module.js';
import { Member, PersonalAccessToken } from '../../domain/entities/index.js';
import { PersonalAccessTokenRevocationForbiddenException } from '../../domain/exceptions/index.js';
import { PersonalAccessTokenId } from '../../domain/value-objects/index.js';
import { InvalidPersonalAccessTokenException } from '../exceptions/index.js';
import {
  MemberRepository,
  PersonalAccessTokenRepository,
  PersonalAccessTokenSecrets,
} from '../ports/outbound/index.js';

import { MembersService } from './members.service.js';
import { PersonalAccessTokensService } from './personal-access-tokens.service.js';
import { WorkspacesService } from './workspaces.service.js';

function actor(email: string): Actor {
  return { accountId: new AccountId().value, email };
}

describe('PersonalAccessTokensService integration', () => {
  let app: TestingApp;

  beforeAll(async () => {
    app = await TestingApp.create({ imports: [WorkspaceModule.register({})] });
  });

  afterEach(() => app.clearDatabase());

  afterAll(() => app?.close());

  /** Ada owns the Workspace; Bob is a Member without a Role. */
  async function setUp(): Promise<{
    workspaceId: string;
    ada: Actor;
    bob: Actor;
    bobMember: Member;
  }> {
    const ada = actor('ada@example.com');
    const bob = actor('bob@example.com');
    const workspace = await app
      .get(WorkspacesService)
      .create(ada, { name: 'Acme', slug: 'acme' });
    const bobMember = Member.join({
      workspaceId: workspace.id,
      accountId: bob.accountId,
      email: bob.email,
    });
    await app
      .get(UnitOfWork)
      .run(() => app.get(MemberRepository).save(bobMember));

    return { workspaceId: workspace.id, ada, bob, bobMember };
  }

  function createToken(creator: Actor, workspaceId: string) {
    return app.get(PersonalAccessTokensService).create(creator, workspaceId, {
      name: 'Claude Code',
      level: 'contributor',
      lifetimeDays: 90,
    });
  }

  describe('create', () => {
    it('returns the secret once and never stores it', async () => {
      // Arrange
      const { workspaceId, bob } = await setUp();

      // Act
      const created = await createToken(bob, workspaceId);

      // Assert
      expect(created.secret).toMatch(/^intr_/);
      expect(created.token).toMatchObject({
        name: 'Claude Code',
        secretHint: `intr_…${created.secret.slice(-4)}`,
        level: 'contributor',
        memberEmail: 'bob@example.com',
        lastUsedAt: null,
      });
      const stored = await app
        .get(PersonalAccessTokenRepository)
        .findOne({ id: new PersonalAccessTokenId(created.token.id) });
      expect(stored?.secretHash.value).not.toBe(created.secret);
    });
  });

  describe('list', () => {
    it('shows a Member only their own tokens', async () => {
      // Arrange
      const { workspaceId, ada, bob } = await setUp();
      await createToken(ada, workspaceId);
      const own = await createToken(bob, workspaceId);

      // Act
      const tokens = await app
        .get(PersonalAccessTokensService)
        .list(bob, workspaceId);

      // Assert
      expect(tokens).toEqual([own.token]);
    });

    it('shows an Owner every token in the Workspace', async () => {
      // Arrange
      const { workspaceId, ada, bob } = await setUp();
      await createToken(ada, workspaceId);
      await createToken(bob, workspaceId);

      // Act
      const tokens = await app
        .get(PersonalAccessTokensService)
        .list(ada, workspaceId);

      // Assert
      expect(tokens.map(token => token.memberEmail).sort()).toEqual([
        'ada@example.com',
        'bob@example.com',
      ]);
    });
  });

  describe('revoke', () => {
    it("lets an Owner revoke a Member's token, which then stops working", async () => {
      // Arrange
      const { workspaceId, ada, bob } = await setUp();
      const { token, secret } = await createToken(bob, workspaceId);

      // Act
      await app
        .get(PersonalAccessTokensService)
        .revoke(ada, workspaceId, token.id);

      // Assert
      await expect(
        app.get(PersonalAccessTokensService).authenticate(secret),
      ).rejects.toBeInstanceOf(InvalidPersonalAccessTokenException);
    });

    it("rejects a Member revoking someone else's token", async () => {
      // Arrange
      const { workspaceId, ada, bob } = await setUp();
      const { token } = await createToken(ada, workspaceId);

      // Act
      const revoking = app
        .get(PersonalAccessTokensService)
        .revoke(bob, workspaceId, token.id);

      // Assert
      await expect(revoking).rejects.toBeInstanceOf(
        PersonalAccessTokenRevocationForbiddenException,
      );
    });
  });

  describe('authenticate', () => {
    it('tells who the agent acts for and records the use', async () => {
      // Arrange
      const { workspaceId, bob } = await setUp();
      const { secret } = await createToken(bob, workspaceId);

      // Act
      const caller = await app
        .get(PersonalAccessTokensService)
        .authenticate(secret);

      // Assert
      expect(caller).toEqual({
        actor: bob,
        workspaceId,
        level: 'contributor',
      });
      const [token] = await app
        .get(PersonalAccessTokensService)
        .list(bob, workspaceId);
      expect(token?.lastUsedAt).not.toBeNull();
    });

    it('rejects an unknown secret', async () => {
      // Act
      const authenticating = app
        .get(PersonalAccessTokensService)
        .authenticate('intr_unknown');

      // Assert
      await expect(authenticating).rejects.toBeInstanceOf(
        InvalidPersonalAccessTokenException,
      );
    });

    it('rejects an expired token', async () => {
      // Arrange
      const { workspaceId, bobMember } = await setUp();
      const { secret, hash, hint } = app
        .get(PersonalAccessTokenSecrets)
        .issue();
      const past = Temporal.Now.instant().subtract({ hours: 1 });
      const expired = PersonalAccessToken.restore({
        id: new PersonalAccessTokenId().value,
        workspaceId,
        memberId: bobMember.id.value,
        name: 'Old',
        level: 'viewer',
        secretHash: hash,
        secretHint: hint,
        createdAt: past.subtract({ hours: 24 }),
        expiresAt: past,
        lastUsedAt: null,
      });
      await app
        .get(UnitOfWork)
        .run(() => app.get(PersonalAccessTokenRepository).save(expired));

      // Act
      const authenticating = app
        .get(PersonalAccessTokensService)
        .authenticate(secret);

      // Assert
      await expect(authenticating).rejects.toBeInstanceOf(
        InvalidPersonalAccessTokenException,
      );
    });

    it('rejects the token of a Member who left', async () => {
      // Arrange
      const { workspaceId, bob } = await setUp();
      const { secret } = await createToken(bob, workspaceId);
      await app.get(MembersService).leave(bob, workspaceId);

      // Act
      const authenticating = app
        .get(PersonalAccessTokensService)
        .authenticate(secret);

      // Assert
      await expect(authenticating).rejects.toBeInstanceOf(
        InvalidPersonalAccessTokenException,
      );
    });
  });
});
