import { createBrowserRouter, redirect } from 'react-router';

import { SignInPage, SignUpPage } from '@/pages/auth';
import { InvitationsPage } from '@/pages/invitations';
import { KnowledgeEditorPage } from '@/pages/knowledge-editor';
import { KnowledgeItemPage } from '@/pages/knowledge-item';
import { ProjectAccessPage } from '@/pages/project-access';
import { ProjectInterviewPage } from '@/pages/project-interview';
import { ProjectKnowledgePage } from '@/pages/project-knowledge';
import { ProjectOverviewPage } from '@/pages/project-overview';
import { ProjectSettingsPage } from '@/pages/project-settings';
import { StartPage } from '@/pages/start';
import { WorkspaceMembersPage } from '@/pages/workspace-members';
import { WorkspaceProjectsPage } from '@/pages/workspace-projects';
import { WorkspaceSettingsPage } from '@/pages/workspace-settings';
import { WorkspaceTokensPage } from '@/pages/workspace-tokens';
import {
  KNOWLEDGE_PAGES,
  PLATFORM_OBJECT_PAGES,
  PLATFORM_PAGES,
  platformPath,
  PROJECT_PAGES,
  ROUTES,
  WORKSPACE_PAGES,
} from '@/shared/config';
import { AppShell, PlatformGate } from '@/widgets/app-shell';

import { requireNoSession, requireSession } from './guards';
import { SessionRedirects } from './session-redirects';

export const router = createBrowserRouter([
  {
    Component: SessionRedirects,
    children: [
      { path: ROUTES.home, loader: requireSession, Component: StartPage },
      {
        path: ROUTES.invitations,
        loader: requireSession,
        Component: InvitationsPage,
      },
      {
        path: ROUTES.workspace,
        loader: requireSession,
        Component: AppShell,
        children: [
          { index: true, Component: WorkspaceProjectsPage },
          { path: WORKSPACE_PAGES.members, Component: WorkspaceMembersPage },
          { path: WORKSPACE_PAGES.tokens, Component: WorkspaceTokensPage },
          { path: WORKSPACE_PAGES.settings, Component: WorkspaceSettingsPage },
          {
            path: ROUTES.project,
            children: [
              { index: true, Component: ProjectOverviewPage },
              {
                path: PROJECT_PAGES.knowledge,
                children: [
                  { index: true, Component: ProjectKnowledgePage },
                  { path: KNOWLEDGE_PAGES.new, Component: KnowledgeEditorPage },
                  { path: KNOWLEDGE_PAGES.item, Component: KnowledgeItemPage },
                  {
                    path: KNOWLEDGE_PAGES.edit,
                    Component: KnowledgeEditorPage,
                  },
                ],
              },
              {
                path: PROJECT_PAGES.interview,
                Component: ProjectInterviewPage,
              },
              { path: PROJECT_PAGES.roles, Component: ProjectAccessPage },
              { path: PROJECT_PAGES.settings, Component: ProjectSettingsPage },
            ],
          },
        ],
      },
      {
        path: ROUTES.platform,
        loader: requireSession,
        Component: AppShell,
        children: [
          {
            Component: PlatformGate,
            // Only a Platform Admin opens these pages, so nobody else loads them.
            children: [
              {
                index: true,
                loader: () => redirect(platformPath(PLATFORM_PAGES.agents)),
              },
              {
                path: PLATFORM_PAGES.agents,
                children: [
                  {
                    index: true,
                    lazy: async () => ({
                      Component: (await import('@/pages/platform-agents'))
                        .PlatformAgentsPage,
                    }),
                  },
                  {
                    path: PLATFORM_OBJECT_PAGES.new,
                    lazy: async () => ({
                      Component: (await import('@/pages/platform-agent'))
                        .PlatformAgentPage,
                    }),
                  },
                  {
                    path: PLATFORM_OBJECT_PAGES.agent,
                    lazy: async () => ({
                      Component: (await import('@/pages/platform-agent'))
                        .PlatformAgentPage,
                    }),
                  },
                ],
              },
              {
                path: PLATFORM_PAGES.skills,
                children: [
                  {
                    index: true,
                    lazy: async () => ({
                      Component: (await import('@/pages/platform-skills'))
                        .PlatformSkillsPage,
                    }),
                  },
                  {
                    path: PLATFORM_OBJECT_PAGES.new,
                    lazy: async () => ({
                      Component: (await import('@/pages/platform-skill'))
                        .PlatformSkillPage,
                    }),
                  },
                  {
                    path: PLATFORM_OBJECT_PAGES.skill,
                    lazy: async () => ({
                      Component: (await import('@/pages/platform-skill'))
                        .PlatformSkillPage,
                    }),
                  },
                ],
              },
              {
                path: PLATFORM_PAGES.modelProfiles,
                lazy: async () => ({
                  Component: (await import('@/pages/platform-models'))
                    .PlatformModelsPage,
                }),
              },
              {
                path: PLATFORM_PAGES.changes,
                lazy: async () => ({
                  Component: (await import('@/pages/platform-changes'))
                    .PlatformChangesPage,
                }),
              },
            ],
          },
        ],
      },
      {
        path: ROUTES.auth,
        loader: requireNoSession,
        children: [
          { index: true, loader: () => redirect(ROUTES.signIn) },
          { path: ROUTES.signIn, Component: SignInPage },
          { path: ROUTES.signUp, Component: SignUpPage },
        ],
      },
      { path: '*', loader: () => redirect(ROUTES.home) },
    ],
  },
]);
