import { Invitation, Member } from '../entities/index.js';

export class InvitationAcceptanceService {
  public accept(
    invitation: Invitation,
    props: InvitationAcceptanceProps,
  ): Member {
    invitation.accept();
    if (props.member) {
      props.member.rejoin();

      return props.member;
    }

    return Member.join({
      workspaceId: invitation.workspaceId.value,
      accountId: props.accountId,
      email: invitation.email.value,
      name: props.name,
    });
  }
}

type InvitationAcceptanceProps = {
  readonly accountId: string;
  /** The Account's name, as the Actor carries it. */
  readonly name: string;
  readonly member: Member | null;
};
