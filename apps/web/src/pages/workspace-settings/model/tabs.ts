import { Bot, Settings, Users } from 'lucide-react';

import { ROUTES } from '@/shared/config';
import type { SettingsTabItem } from '@/widgets/app-shell';

export const WORKSPACE_TABS: readonly SettingsTabItem[] = [
  {
    label: 'General',
    path: ROUTES.WORKSPACE.SETTINGS.WORKSPACE.GENERAL,
    icon: Settings,
  },
  {
    label: 'Members',
    path: ROUTES.WORKSPACE.SETTINGS.WORKSPACE.MEMBERS,
    icon: Users,
  },
  {
    label: 'Agents',
    path: ROUTES.WORKSPACE.SETTINGS.WORKSPACE.AGENTS,
    icon: Bot,
  },
];
