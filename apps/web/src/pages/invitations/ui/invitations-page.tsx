import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { ReceivedInvitations } from '@/features/respond-to-invitation';
import { ROUTES } from '@/shared/config';
import { Button, Page, PageHeader } from '@/shared/ui';
import { CoverFrame } from '@/widgets/app-shell';

/** The invitations the signed-in person received and has not answered. */
export function InvitationsPage() {
  const { t } = useTranslation();

  return (
    <CoverFrame>
      <Page className='max-w-2xl'>
        <PageHeader
          title={t('receivedInvitations.title')}
          description={t('receivedInvitations.description')}
          actions={
            <Button
              variant='ghost'
              render={<Link to={ROUTES.home} />}
              nativeButton={false}
            >
              <ArrowLeft />
              {t('shell.toWorkspaces')}
            </Button>
          }
        />
        <ReceivedInvitations emptyText={t('receivedInvitations.empty')} />
      </Page>
    </CoverFrame>
  );
}
