import { SettingsLayout } from '@/widgets/app-shell';

import { WORKSPACE_TABS } from '../model/tabs';

export const WorkspaceSettingsPage = () => (
  <SettingsLayout title='Workspace' tabs={WORKSPACE_TABS} />
);
