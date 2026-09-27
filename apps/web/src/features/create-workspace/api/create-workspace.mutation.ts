import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  CreateWorkspaceMutation,
  CreateWorkspaceMutationVariables,
} from './__generated__/create-workspace.mutation.generated';

export const CREATE_WORKSPACE_MUTATION: TypedDocumentNode<
  CreateWorkspaceMutation,
  CreateWorkspaceMutationVariables
> = gql`
  mutation CreateWorkspace($input: CreateWorkspaceInput!) {
    createWorkspace(input: $input) {
      id
      name
      alias
    }
  }
`;
