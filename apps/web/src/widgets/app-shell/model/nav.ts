import {
  Building2,
  FolderKanban,
  GitBranch,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

import { ROUTES } from '@/shared/config';

export type NavItem = {
  readonly label: string;
  readonly path: string;
  readonly icon: LucideIcon;
};

/** The sidebar outside a project. */
export const WORKSPACE_NAV: readonly NavItem[] = [
  { label: 'Projects', path: ROUTES.WORKSPACE.PROJECTS, icon: FolderKanban },
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

/** The sidebar inside a project. Chat leads: most work goes through the agents. */
export const PROJECT_NAV: readonly NavItem[] = [
  { label: 'Chat', path: ROUTES.WORKSPACE.PROJECT.CHAT, icon: MessagesSquare },
  {
    label: 'Overview',
    path: ROUTES.WORKSPACE.PROJECT.OVERVIEW,
    icon: LayoutDashboard,
  },
  {
    label: 'Repositories',
    path: ROUTES.WORKSPACE.PROJECT.REPOSITORIES,
    icon: GitBranch,
  },
  {
    label: 'Settings',
    path: ROUTES.WORKSPACE.PROJECT.SETTINGS.ROOT,
    icon: Settings,
  },
];
