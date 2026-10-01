import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { MongooseUnitOfWork } from '@intentra/platform-persistence';
import type { WorkspaceId } from '@intentra/shared-kernel';

import {
  MemberRepository,
  type MemberQueryProps,
} from '../../../application/ports/outbound/index.js';
import { Member } from '../../../domain/entities/index.js';
import { AccountNameModel, MemberModel } from '../../database/index.js';

@Injectable()
export class MemberRepositoryAdapter extends MemberRepository {
  constructor(
    @InjectModel(MemberModel.name)
    private readonly memberModel: Model<MemberModel>,
    @InjectModel(AccountNameModel.name)
    private readonly accountNameModel: Model<AccountNameModel>,
    private readonly unitOfWork: MongooseUnitOfWork,
  ) {
    super();
  }

  public async save(member: Member): Promise<void> {
    await this.memberModel
      .replaceOne(
        { _id: member.id.value },
        {
          workspaceId: member.workspaceId.value,
          accountId: member.accountId.value,
          email: member.email.value,
          role: member.role?.value ?? null,
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

    if (!document) {
      return null;
    }
    const [member] = await this.withNames([document]);

    return member ?? null;
  }

  public async findMany(props: MemberQueryProps): Promise<Member[]> {
    const documents = await this.memberModel
      .find(this.toFilter(props))
      .sort({ email: 1 })
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return this.withNames(documents);
  }

  /** The Members, each with its Account's current name, read from IAM in one query. */
  private async withNames(documents: MemberModel[]): Promise<Member[]> {
    const accounts = await this.accountNameModel
      .find(
        { _id: { $in: documents.map(document => document.accountId) } },
        { name: 1 },
      )
      .session(this.unitOfWork.session)
      .lean()
      .exec();
    const names = new Map(
      accounts.map(account => [account._id.toHexString(), account.name]),
    );

    return documents.map(document => {
      const name = names.get(document.accountId.toHexString());
      if (name === undefined) {
        // A Member goes with its Account: one without is broken data.
        throw new Error(`Member ${document._id.toHexString()} has no Account`);
      }

      return this.toDomain(document, name);
    });
  }

  public async deleteMany(props: {
    readonly workspaceId: WorkspaceId;
  }): Promise<void> {
    await this.memberModel
      .deleteMany({ workspaceId: props.workspaceId.value })
      .session(this.unitOfWork.requireSession())
      .exec();
  }

  private toFilter(props: MemberQueryProps) {
    return {
      ...(props.id && { _id: props.id.value }),
      ...(props.workspaceId && { workspaceId: props.workspaceId.value }),
      ...(props.accountId && { accountId: props.accountId.value }),
      ...(props.email && { email: props.email.value }),
      ...(props.status && { status: props.status.value }),
      ...(props.role && { role: props.role.value }),
    };
  }

  private toDomain(document: MemberModel, name: string): Member {
    return Member.restore({
      id: document._id.toHexString(),
      workspaceId: document.workspaceId.toHexString(),
      accountId: document.accountId.toHexString(),
      email: document.email,
      name,
      role: document.role,
      status: document.status,
    });
  }
}

export const MEMBER_REPOSITORY_PROVIDER: Provider = {
  provide: MemberRepository,
  useClass: MemberRepositoryAdapter,
};
