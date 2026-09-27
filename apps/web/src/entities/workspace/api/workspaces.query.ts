import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  WorkspacesQuery,
  WorkspacesQueryVariables,
} from './__generated__/workspaces.query.generated';

export const WORKSPACES_QUERY: TypedDocumentNode<
  WorkspacesQuery,
  WorkspacesQueryVariables
> = gql`
  query Workspaces {
    workspaces {
      id
      name
      alias
    }
  }
`;
