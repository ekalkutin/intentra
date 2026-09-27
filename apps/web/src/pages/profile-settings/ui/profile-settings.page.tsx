import { SettingsLayout } from '@/widgets/app-shell';

import { PROFILE_TABS } from '../model/tabs';

export const ProfileSettingsPage = () => (
  <SettingsLayout title='Profile' tabs={PROFILE_TABS} />
);
