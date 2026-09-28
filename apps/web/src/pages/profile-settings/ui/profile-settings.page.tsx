import { PageHeader, SettingsLayout } from '@/widgets/app-shell';

import { PROFILE_TABS } from '../model/tabs';

export const ProfileSettingsPage = () => (
  <>
    <PageHeader title='Profile settings' />
    <SettingsLayout title='Profile' tabs={PROFILE_TABS} />
  </>
);
