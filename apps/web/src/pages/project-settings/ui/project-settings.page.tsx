import { PageHeader, SettingsLayout } from '@/widgets/app-shell';

import { PROJECT_SETTINGS_TABS } from '../model/tabs';

export const ProjectSettingsPage = () => (
  <>
    <PageHeader title='Project settings' />
    <SettingsLayout title='Project' tabs={PROJECT_SETTINGS_TABS} />
  </>
);
