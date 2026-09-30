import { useTranslation } from 'react-i18next';

import { useCurrentWorkspace } from '@/entities/workspace';
import { List, Page, PageHeader, PageSection, PageSkeleton } from '@/shared/ui';

import { InvitationRows, InviteForm } from './invitation-rows';
import { MemberRows } from './member-rows';

/** Who works in the Workspace, and who has been invited to. */
export function WorkspaceMembersPage() {
  const { t } = useTranslation();
  const { workspace, access } = useCurrentWorkspace();

  if (!workspace || !access) {
    return <PageSkeleton />;
  }

  return (
    <Page>
      <PageHeader
        title={t('members.title')}
        description={t('members.description')}
      />
      <List>
        <MemberRows workspace={workspace} access={access} />
      </List>
      {access.canManageInvitations && (
        <PageSection
          title={t('members.invitationsSection')}
          description={t('members.invitationsDescription')}
        >
          <InviteForm workspace={workspace} />
          <List>
            <InvitationRows workspace={workspace} />
          </List>
        </PageSection>
      )}
    </Page>
  );
}
