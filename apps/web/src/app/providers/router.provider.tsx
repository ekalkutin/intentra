import { createBrowserRouter, Navigate } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { AgentsPage } from '@/pages/agents';
import { ChatPage } from '@/pages/chat';
import { NewWorkspacePage } from '@/pages/new-workspace';
import { NotFoundPage } from '@/pages/not-found';
import { OnboardingPage } from '@/pages/onboarding';
import {
  ProfileAccessTokensTab,
  ProfileGeneralTab,
  ProfileSecurityTab,
  ProfileSettingsPage,
} from '@/pages/profile-settings';
import { ProjectsPage } from '@/pages/projects';
import { SignInPage } from '@/pages/sign-in';
import { SignUpPage } from '@/pages/sign-up';
import {
  WorkspaceGeneralTab,
  WorkspaceMembersTab,
  WorkspaceSettingsPage,
} from '@/pages/workspace-settings';
import { ROUTES } from '@/shared/config';
import { AppShell } from '@/widgets/app-shell';
import { AuthLayout } from '@/widgets/auth-layout';

import {
  DefaultWorkspaceRedirect,
  RedirectAuthenticated,
  RequireSession,
  WorkspaceGate,
  WorkspaceScope,
} from '../guards';

const router = createBrowserRouter([
  {
    element: <RedirectAuthenticated />,
    children: [
      {
        path: ROUTES.AUTH.ROOT,
        element: <AuthLayout />,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.AUTH.SIGN_IN} replace />,
          },
          { path: ROUTES.AUTH.SIGN_IN, element: <SignInPage /> },
          { path: ROUTES.AUTH.SIGN_UP, element: <SignUpPage /> },
        ],
      },
    ],
  },
  {
    element: <RequireSession />,
    children: [
      {
        element: <WorkspaceGate requireWorkspace />,
        children: [
          { path: ROUTES.HOME, element: <DefaultWorkspaceRedirect /> },
          { path: ROUTES.NEW_WORKSPACE, element: <NewWorkspacePage /> },
          {
            path: ROUTES.WORKSPACE.ROOT,
            element: <WorkspaceScope />,
            children: [
              {
                element: <AppShell />,
                children: [
                  {
                    index: true,
                    element: <Navigate to='projects' replace />,
                  },
                  {
                    path: ROUTES.WORKSPACE.PROJECTS,
                    element: <ProjectsPage />,
                  },
                  { path: ROUTES.WORKSPACE.AGENTS, element: <AgentsPage /> },
                  { path: ROUTES.WORKSPACE.CHAT, element: <ChatPage /> },
                  {
                    path: ROUTES.WORKSPACE.SETTINGS.ROOT,
                    element: <Navigate to='profile' replace />,
                  },
                  {
                    path: ROUTES.WORKSPACE.SETTINGS.PROFILE.ROOT,
                    element: <ProfileSettingsPage />,
                    children: [
                      {
                        index: true,
                        element: <Navigate to='general' replace />,
                      },
                      {
                        path: ROUTES.WORKSPACE.SETTINGS.PROFILE.GENERAL,
                        element: <ProfileGeneralTab />,
                      },
                      {
                        path: ROUTES.WORKSPACE.SETTINGS.PROFILE.SECURITY,
                        element: <ProfileSecurityTab />,
                      },
                      {
                        path: ROUTES.WORKSPACE.SETTINGS.PROFILE.ACCESS_TOKENS,
                        element: <ProfileAccessTokensTab />,
                      },
                    ],
                  },
                  {
                    path: ROUTES.WORKSPACE.SETTINGS.WORKSPACE.ROOT,
                    element: <WorkspaceSettingsPage />,
                    children: [
                      {
                        index: true,
                        element: <Navigate to='general' replace />,
                      },
                      {
                        path: ROUTES.WORKSPACE.SETTINGS.WORKSPACE.GENERAL,
                        element: <WorkspaceGeneralTab />,
                      },
                      {
                        path: ROUTES.WORKSPACE.SETTINGS.WORKSPACE.MEMBERS,
                        element: <WorkspaceMembersTab />,
                      },
                    ],
                  },
                  { path: '*', element: <NotFoundPage /> },
                ],
              },
            ],
          },
        ],
      },
      {
        element: <WorkspaceGate requireWorkspace={false} />,
        children: [{ path: ROUTES.ONBOARDING, element: <OnboardingPage /> }],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

export const AppRouterProvider = () => <RouterProvider router={router} />;
