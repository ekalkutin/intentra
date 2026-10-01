import { useTranslation } from 'react-i18next';
import { Link, Outlet } from 'react-router';

import { useMeQuery } from '@/entities/session';
import { ROUTES } from '@/shared/config';
import { Button, Page, PageHeader, PageSkeleton } from '@/shared/ui';

/** The Platform Admin's pages; anyone else is told they are not theirs. */
export function PlatformGate() {
  const { t } = useTranslation();
  const { data: me } = useMeQuery();

  if (!me) {
    return <PageSkeleton />;
  }
  if (me.isPlatformAdmin) {
    return <Outlet />;
  }

  return (
    <Page>
      <PageHeader
        title={t('platform.forbidden')}
        description={t('platform.forbiddenHint')}
        actions={
          <Button
            variant='outline'
            render={<Link to={ROUTES.home} />}
            nativeButton={false}
          >
            {t('shell.toWorkspaces')}
          </Button>
        }
      />
    </Page>
  );
}
