import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import {
  isDuplicateKeyError,
  MongooseUnitOfWork,
} from '@intentra/platform-persistence';
import type { WorkspaceId } from '@intentra/shared-kernel';

import { InvitationAlreadyPendingException } from '../../../application/exceptions/index.js';
import {
  InvitationRepository,
  type InvitationQueryProps,
} from '../../../application/ports/outbound/index.js';
import { Invitation } from '../../../domain/entities/index.js';
import { InvitationModel } from '../../database/index.js';

@Injectable()
export class InvitationRepositoryAdapter extends InvitationRepository {
  constructor(
    @InjectModel(InvitationModel.name)
    private readonly invitationModel: Model<InvitationModel>,
    private readonly unitOfWork: MongooseUnitOfWork,
  ) {
    super();
  }

  public async save(invitation: Invitation): Promise<void> {
    try {
      await this.invitationModel
        .replaceOne(
          { _id: invitation.id.value },
          {
            workspaceId: invitation.workspaceId.value,
            email: invitation.email.value,
            invitedBy: invitation.invitedBy.value,
            sentAt: new Date(invitation.sentAt.epochMilliseconds),
            expiresAt: new Date(invitation.expiresAt.epochMilliseconds),
            status: invitation.status.value,
          },
          { upsert: true, session: this.unitOfWork.requireSession() },
        )
        .exec();
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new InvitationAlreadyPendingException();
      }
      throw error;
    }
  }

  public async findOne(
    props: InvitationQueryProps,
  ): Promise<Invitation | null> {
    const document = await this.invitationModel
      .findOne(this.toFilter(props))
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return document && this.toDomain(document);
  }

  public async findMany(props: InvitationQueryProps): Promise<Invitation[]> {
    const documents = await this.invitationModel
      .find(this.toFilter(props))
      .sort({ sentAt: -1 })
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return documents.map(document => this.toDomain(document));
  }

  public async deleteMany(props: {
    readonly workspaceId: WorkspaceId;
  }): Promise<void> {
    await this.invitationModel
      .deleteMany({ workspaceId: props.workspaceId.value })
      .session(this.unitOfWork.requireSession())
      .exec();
  }

  private toFilter(props: InvitationQueryProps) {
    return {
      ...(props.id && { _id: props.id.value }),
      ...(props.workspaceId && { workspaceId: props.workspaceId.value }),
      ...(props.email && { email: props.email.value }),
      ...(props.status && { status: props.status.value }),
    };
  }

  private toDomain(document: InvitationModel): Invitation {
    return Invitation.restore({
      id: document._id,
      workspaceId: document.workspaceId,
      email: document.email,
      invitedBy: document.invitedBy,
      sentAt: Temporal.Instant.fromEpochMilliseconds(document.sentAt.getTime()),
      expiresAt: Temporal.Instant.fromEpochMilliseconds(
        document.expiresAt.getTime(),
      ),
      status: document.status,
    });
  }
}

export const INVITATION_REPOSITORY_PROVIDER: Provider = {
  provide: InvitationRepository,
  useClass: InvitationRepositoryAdapter,
};
