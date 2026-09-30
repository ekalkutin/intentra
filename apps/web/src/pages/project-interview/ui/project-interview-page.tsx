import { useTranslation } from 'react-i18next';

import { useCurrentProject } from '@/entities/project';
import { useCurrentWorkspace } from '@/entities/workspace';
import { List, ListEmpty, Page, PageHeader, PageSkeleton } from '@/shared/ui';

/** Not built yet: says what will be here. */
export function ProjectInterviewPage() {
  const { t } = useTranslation();
  const { workspace, access } = useCurrentWorkspace();
  const { project } = useCurrentProject(workspace?.id, access);

  if (!project) {
    return <PageSkeleton />;
  }

  return (
    <Page>
      <PageHeader title={t('interview.title')} />
      <List>
        <ListEmpty>{t('interview.pending')}</ListEmpty>
      </List>
    </Page>
  );
}
