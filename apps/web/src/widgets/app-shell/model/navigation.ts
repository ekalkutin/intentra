import {
  Bot,
  Cpu,
  GitCompareArrows,
  KeyRound,
  LayoutList,
  Library,
  ListTree,
  MessagesSquare,
  NotebookText,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Users,
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
  { page: undefined, icon: ListTree, labelKey: 'overview' },
  { page: PROJECT_PAGES.knowledge, icon: LayoutList, labelKey: 'knowledge' },
  {
    page: PROJECT_PAGES.interview,
    icon: MessagesSquare,
    labelKey: 'interview',
  },
  { page: PROJECT_PAGES.roles, icon: ShieldCheck, labelKey: 'roles' },
  { page: PROJECT_PAGES.settings, icon: Settings, labelKey: 'settings' },
] as const satisfies readonly Entry<ProjectPage>[];

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
