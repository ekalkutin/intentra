import { KeyRound, ShieldCheck, UserRound } from 'lucide-react';

import { ROUTES } from '@/shared/config';
import type { SettingsTabItem } from '@/widgets/app-shell';

export const PROFILE_TABS: readonly SettingsTabItem[] = [
  {
    label: 'General',
    path: ROUTES.WORKSPACE.SETTINGS.PROFILE.GENERAL,
    icon: UserRound,
  },
  {
    label: 'Security',
    path: ROUTES.WORKSPACE.SETTINGS.PROFILE.SECURITY,
    icon: ShieldCheck,
  },
  {
    label: 'Access tokens',
    path: ROUTES.WORKSPACE.SETTINGS.PROFILE.ACCESS_TOKENS,
    icon: KeyRound,
  },
];
