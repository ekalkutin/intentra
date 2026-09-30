import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
} from 'react-router';

import { ProjectLayout } from '@/components/layout/project-layout';
import { WorkspaceLayout } from '@/components/layout/workspace-layout';
import { selectIsSignedIn } from '@/features/auth/auth-slice';
import { AuthPage } from '@/pages/auth-page';
import { HomePage } from '@/pages/home-page';
import { AssistantPage } from '@/pages/project/assistant-page';
import { KnowledgeItemPage } from '@/pages/project/knowledge-item-page';
import { KnowledgeListPage } from '@/pages/project/knowledge-list-page';
import { ProjectSettingsPage } from '@/pages/project/project-settings-page';
import { ProjectRolesPage } from '@/pages/project/roles-page';
import { InvitationsPage } from '@/pages/workspace/invitations-page';
import { MembersPage } from '@/pages/workspace/members-page';
import { ProjectsPage } from '@/pages/workspace/projects-page';
import { WorkspaceSettingsPage } from '@/pages/workspace/settings-page';
import { TokensPage } from '@/pages/workspace/tokens-page';

import { useAppSelector } from './hooks';

function RequireAuth() {
  const signedIn = useAppSelector(selectIsSignedIn);
  const location = useLocation();
  if (!signedIn) {
    return (
      <Navigate to='/sign-in' replace state={{ from: location.pathname }} />
    );
  }
  return <Outlet />;
}

export const router = createBrowserRouter([
  { path: '/sign-in', element: <AuthPage mode='sign-in' /> },
  { path: '/sign-up', element: <AuthPage mode='sign-up' /> },
  {
    element: <RequireAuth />,
    children: [
      { path: '/', element: <HomePage /> },
      {
        path: '/w/:workspaceId',
        element: <WorkspaceLayout />,
        children: [
          { index: true, element: <Navigate to='projects' replace /> },
          { path: 'projects', element: <ProjectsPage /> },
          { path: 'members', element: <MembersPage /> },
          { path: 'invitations', element: <InvitationsPage /> },
          { path: 'tokens', element: <TokensPage /> },
          { path: 'settings', element: <WorkspaceSettingsPage /> },
          {
            path: 'p/:projectId',
            element: <ProjectLayout />,
            children: [
              { index: true, element: <Navigate to='knowledge' replace /> },
              { path: 'knowledge', element: <KnowledgeListPage /> },
              { path: 'knowledge/:key', element: <KnowledgeItemPage /> },
              { path: 'assistant', element: <AssistantPage /> },
              { path: 'roles', element: <ProjectRolesPage /> },
              { path: 'settings', element: <ProjectSettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to='/' replace /> },
]);
