import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { NoUnitOfWorkException } from '@intentra/platform-persistence';
import { TestingApp } from '@intentra/platform-testing';
import { AccountId, WorkspaceId } from '@intentra/shared-kernel';

import { MemberRepository } from '../../../application/ports/outbound/index.js';
import { Member } from '../../../domain/entities/index.js';
import { WorkspaceModule } from '../../../workspace.module.js';

describe('MemberRepositoryAdapter integration', () => {
  let app: TestingApp;

  beforeAll(async () => {
    app = await TestingApp.create({ imports: [WorkspaceModule.register({})] });
  });

  afterAll(() => app?.close());

  it('refuses to write outside a unit of work', async () => {
    // Arrange
    const member = Member.join({
      workspaceId: new WorkspaceId().value,
      accountId: new AccountId().value,
      email: 'member@example.com',
    });

    // Act
    const saving = app.get(MemberRepository).save(member);

    // Assert
    await expect(saving).rejects.toBeInstanceOf(NoUnitOfWorkException);
  });
});
