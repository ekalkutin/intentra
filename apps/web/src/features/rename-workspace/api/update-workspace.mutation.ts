import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  UpdateWorkspaceMutation,
  UpdateWorkspaceMutationVariables,
} from './__generated__/update-workspace.mutation.generated';

export const UPDATE_WORKSPACE_MUTATION: TypedDocumentNode<
  UpdateWorkspaceMutation,
  UpdateWorkspaceMutationVariables
> = gql`
  mutation UpdateWorkspace($id: ID!, $input: UpdateWorkspaceInput!) {
    updateWorkspace(id: $id, input: $input) {
      id
      name
      alias
    }
  }
`;
