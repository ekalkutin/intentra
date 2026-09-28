import { PageHeader, SettingsLayout } from '@/widgets/app-shell';

import { WORKSPACE_TABS } from '../model/tabs';

export const WorkspaceSettingsPage = () => (
  <>
    <PageHeader title='Workspace settings' />
    <SettingsLayout title='Workspace' tabs={WORKSPACE_TABS} />
  </>
);
