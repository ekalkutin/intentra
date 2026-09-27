import {
  Bot,
  Building2,
  FolderKanban,
  MessagesSquare,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

import { ROUTES } from '@/shared/config';

export type NavItem = {
  readonly label: string;
  readonly path: string;
  readonly icon: LucideIcon;
};

export const WORK_NAV: readonly NavItem[] = [
  { label: 'Projects', path: ROUTES.WORKSPACE.PROJECTS, icon: FolderKanban },
];

export const AI_TEAM_NAV: readonly NavItem[] = [
  { label: 'Chat', path: ROUTES.WORKSPACE.CHAT, icon: MessagesSquare },
  { label: 'Agents', path: ROUTES.WORKSPACE.AGENTS, icon: Bot },
];

/** One entry per settings category; each opens its own settings page. */
export const SETTINGS_NAV: readonly NavItem[] = [
  {
    label: 'Profile',
    path: ROUTES.WORKSPACE.SETTINGS.PROFILE.ROOT,
    icon: UserRound,
  },
  {
    label: 'Workspace',
    path: ROUTES.WORKSPACE.SETTINGS.WORKSPACE.ROOT,
    icon: Building2,
  },
];
