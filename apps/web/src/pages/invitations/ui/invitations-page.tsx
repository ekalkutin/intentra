import { useTranslation } from 'react-i18next';

import { ReceivedInvitations } from '@/features/respond-to-invitation';
import { Page, PageHeader } from '@/shared/ui';

/** The invitations the signed-in person received and has not answered. */
export function InvitationsPage() {
  const { t } = useTranslation();

  return (
    <Page>
      <PageHeader
        title={t('receivedInvitations.title')}
        description={t('receivedInvitations.description')}
      />
      <ReceivedInvitations emptyText={t('receivedInvitations.empty')} />
    </Page>
  );
}
