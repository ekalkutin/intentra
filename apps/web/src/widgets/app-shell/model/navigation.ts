import {
  BookText,
  Bot,
  Cpu,
  GitCompareArrows,
  KeyRound,
  LayoutList,
  Library,
  MessagesSquare,
  NotebookText,
  SearchCheck,
  Settings,
  SlidersHorizontal,
  Users,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';

import {
  PLATFORM_PAGES,
  PROJECT_PAGES,
  WORKSPACE_PAGES,
  type PlatformPage,
  type ProjectPage,
  type WorkspacePage,
} from '@/shared/config';
import type {
  ProjectAccessDto,
  WorkspaceAccessDto,
} from '@intentra/contracts/workspace';

type Entry<Page> = {
  /** Undefined for the index page. */
  readonly page: Page | undefined;
  readonly icon: LucideIcon;
  readonly labelKey: string;
};

/** The pages of a Workspace, in the order the sidebar lists them. */
export const WORKSPACE_NAVIGATION = [
  { page: undefined, icon: Library, labelKey: 'projects' },
  { page: WORKSPACE_PAGES.members, icon: Users, labelKey: 'members' },
  { page: WORKSPACE_PAGES.tokens, icon: KeyRound, labelKey: 'tokens' },
  { page: WORKSPACE_PAGES.settings, icon: Settings, labelKey: 'settings' },
] as const satisfies readonly Entry<WorkspacePage>[];

/** The sections of a Project, in the order the sidebar lists them. */
export const PROJECT_NAVIGATION = [
  // The Interview is the product's core, so it leads.
  {
    page: PROJECT_PAGES.interview,
    icon: MessagesSquare,
    labelKey: 'interview',
  },
  { page: undefined, icon: BookText, labelKey: 'passport' },
  { page: PROJECT_PAGES.knowledge, icon: LayoutList, labelKey: 'knowledge' },
  { page: PROJECT_PAGES.analysis, icon: SearchCheck, labelKey: 'analysis' },
  { page: PROJECT_PAGES.roles, icon: UsersRound, labelKey: 'roles' },
  { page: PROJECT_PAGES.settings, icon: Settings, labelKey: 'settings' },
] as const satisfies readonly Entry<ProjectPage>[];

/**
 * The Workspace's pages this person may open. Its settings hold the Provider
 * Key and deleting it, so they show only to whoever may manage one of those
 * (the server's verdicts). Its tokens page is the Owner's view of everyone's
 * tokens, so it shows to whoever may see them all; a Member's own tokens are
 * in their account settings.
 */
export function workspaceNavigation(access: WorkspaceAccessDto | undefined) {
  return WORKSPACE_NAVIGATION.filter(entry => {
    switch (entry.page) {
      case WORKSPACE_PAGES.settings:
        return (
          access?.canManageProviderKey === true ||
          access?.canDeleteWorkspace === true
        );
      case WORKSPACE_PAGES.tokens:
        return access?.canSeeAllPersonalAccessTokens === true;
      default:
        return true;
    }
  });
}

/**
 * The Project's pages this person may open. Its settings hold nothing but
 * deleting it, so they show only to whoever may delete it (the server's verdict).
 */
export function projectNavigation(access: ProjectAccessDto | undefined) {
  return PROJECT_NAVIGATION.filter(
    entry =>
      entry.page !== PROJECT_PAGES.settings || access?.canDelete === true,
  );
}

/** The pages of the Platform Admin's section, in the order the sidebar lists them. */
export const PLATFORM_NAVIGATION = [
  { page: PLATFORM_PAGES.agents, icon: Bot, labelKey: 'agents' },
  { page: PLATFORM_PAGES.skills, icon: NotebookText, labelKey: 'skills' },
  { page: PLATFORM_PAGES.modelProfiles, icon: Cpu, labelKey: 'modelProfiles' },
  { page: PLATFORM_PAGES.changes, icon: GitCompareArrows, labelKey: 'changes' },
  {
    page: PLATFORM_PAGES.settings,
    icon: SlidersHorizontal,
    labelKey: 'settings',
  },
] as const satisfies readonly Entry<PlatformPage>[];
