import { Bot, FolderKanban, Settings, type LucideIcon } from 'lucide-react';

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
  { label: 'Agents', path: ROUTES.WORKSPACE.AGENTS, icon: Bot },
];

export const UTILITY_NAV: readonly NavItem[] = [
  { label: 'Settings', path: ROUTES.WORKSPACE.SETTINGS, icon: Settings },
];
