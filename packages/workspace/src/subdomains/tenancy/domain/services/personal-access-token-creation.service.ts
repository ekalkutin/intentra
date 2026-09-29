import { Member, PersonalAccessToken, Workspace } from '../entities/index.js';

import '../exceptions/index.js';

export class PersonalAccessTokenCreationService {
  /** Any Active Member creates tokens for themselves. */
  public create(
    workspace: Workspace,
    creator: Member,
    props: PersonalAccessTokenCreationProps,
  ): PersonalAccessToken {
    creator.ensureActiveIn(workspace.id);

    return PersonalAccessToken.create({
      workspaceId: workspace.id.value,
      memberId: creator.id.value,
      name: props.name,
      level: props.level,
      secretHash: props.secretHash,
      secretHint: props.secretHint,
      lifetimeDays: props.lifetimeDays,
    });
  }
}

type PersonalAccessTokenCreationProps = {
  readonly name: string;
  readonly level: string;
  readonly secretHash: string;
  readonly secretHint: string;
  /** Null for a token that never expires. */
  readonly lifetimeDays: number | null;
};
