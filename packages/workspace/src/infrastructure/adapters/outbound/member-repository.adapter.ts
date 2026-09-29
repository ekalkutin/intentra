import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { MongooseUnitOfWork } from '@intentra/platform-persistence';

import {
  MemberRepository,
  type MemberQueryProps,
} from '../../../application/ports/outbound/index.js';
import { Member } from '../../../domain/entities/index.js';
import { MemberModel } from '../../database/index.js';

@Injectable()
export class MemberRepositoryAdapter implements MemberRepository {
  constructor(
    @InjectModel(MemberModel.name)
    private readonly memberModel: Model<MemberModel>,
    private readonly unitOfWork: MongooseUnitOfWork,
  ) {}

  public async save(member: Member): Promise<void> {
    await this.memberModel
      .replaceOne(
        { _id: member.id.value },
        {
          workspaceId: member.workspaceId.value,
          accountId: member.accountId.value,
          email: member.email.value,
          role: member.role.value,
          status: member.status.value,
        },
        { upsert: true, session: this.unitOfWork.requireSession() },
      )
      .exec();
  }

  public async findOne(props: MemberQueryProps): Promise<Member | null> {
    const document = await this.memberModel
      .findOne(this.toFilter(props))
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return document && this.toDomain(document);
  }

  public async findMany(props: MemberQueryProps): Promise<Member[]> {
    const documents = await this.memberModel
      .find(this.toFilter(props))
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return documents.map(document => this.toDomain(document));
  }

  private toFilter(props: MemberQueryProps) {
    return {
      ...(props.workspaceId && { workspaceId: props.workspaceId.value }),
      ...(props.accountId && { accountId: props.accountId.value }),
      ...(props.email && { email: props.email.value }),
      ...(props.status && { status: props.status.value }),
    };
  }

  private toDomain(document: MemberModel): Member {
    return Member.restore({
      id: document._id,
      workspaceId: document.workspaceId,
      accountId: document.accountId,
      email: document.email,
      role: document.role,
      status: document.status,
    });
  }
}

export const MEMBER_REPOSITORY_PROVIDER: Provider = {
  provide: MemberRepository,
  useClass: MemberRepositoryAdapter,
};
