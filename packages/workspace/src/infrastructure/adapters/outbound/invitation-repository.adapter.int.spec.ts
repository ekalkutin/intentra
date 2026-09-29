import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { TestingApp } from '@intentra/platform-testing';
import { UnitOfWork, WorkspaceId } from '@intentra/shared-kernel';

import { InvitationAlreadyPendingException } from '../../../application/exceptions/index.js';
import { InvitationRepository } from '../../../application/ports/outbound/index.js';
import { Invitation } from '../../../domain/entities/index.js';
import { MemberId } from '../../../domain/value-objects/index.js';
import { WorkspaceModule } from '../../../workspace.module.js';

describe('InvitationRepositoryAdapter integration', () => {
  let app: TestingApp;

  beforeAll(async () => {
    app = await TestingApp.create({ imports: [WorkspaceModule.register({})] });
  });

  afterAll(() => app?.close());

  it('refuses a second Pending Invitation to the same email in a Workspace', async () => {
    // Arrange
    const workspaceId = new WorkspaceId().value;
    const invite = () =>
      Invitation.create({
        workspaceId,
        email: 'bob@example.com',
        invitedBy: new MemberId().value,
      });
    const repository = app.get(InvitationRepository);
    const unitOfWork = app.get(UnitOfWork);
    await unitOfWork.run(() => repository.save(invite()));

    // Act
    const saving = unitOfWork.run(() => repository.save(invite()));

    // Assert
    await expect(saving).rejects.toBeInstanceOf(
      InvitationAlreadyPendingException,
    );
  });
});
