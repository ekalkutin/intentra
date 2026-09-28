import { Settings, Users } from 'lucide-react';

import { ROUTES } from '@/shared/config';
import type { SettingsTabItem } from '@/widgets/app-shell';

export const PROJECT_SETTINGS_TABS: readonly SettingsTabItem[] = [
  {
    label: 'General',
    path: ROUTES.WORKSPACE.PROJECT.SETTINGS.GENERAL,
    icon: Settings,
  },
  {
    label: 'Members',
    path: ROUTES.WORKSPACE.PROJECT.SETTINGS.MEMBERS,
    icon: Users,
  },
];
