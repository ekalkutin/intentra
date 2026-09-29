import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

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
  ) {}

  public async save(member: Member): Promise<void> {
    await this.memberModel
      .replaceOne(
        { _id: member.id.value },
        {
          workspaceId: member.workspaceId.value,
          accountId: member.accountId.value,
          role: member.role.value,
          status: member.status.value,
        },
        { upsert: true },
      )
      .exec();
  }

  public async findMany(props: MemberQueryProps): Promise<Member[]> {
    const documents = await this.memberModel
      .find({
        accountId: props.accountId.value,
        status: props.status.value,
      })
      .lean()
      .exec();

    return documents.map(document => this.toDomain(document));
  }

  private toDomain(document: MemberModel): Member {
    return Member.restore({
      id: document._id,
      workspaceId: document.workspaceId,
      accountId: document.accountId,
      role: document.role,
      status: document.status,
    });
  }
}

export const MEMBER_REPOSITORY_PROVIDER: Provider = {
  provide: MemberRepository,
  useClass: MemberRepositoryAdapter,
};
