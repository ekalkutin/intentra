import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  WorkspaceMembersQuery,
  WorkspaceMembersQueryVariables,
} from './__generated__/workspace-members.query.generated';

/** There is no single-workspace query: the current one is picked by id. */
export const WORKSPACE_MEMBERS_QUERY: TypedDocumentNode<
  WorkspaceMembersQuery,
  WorkspaceMembersQueryVariables
> = gql`
  query WorkspaceMembers {
    workspaces {
      id
      members {
        id
        email
        displayName
      }
    }
  }
`;
