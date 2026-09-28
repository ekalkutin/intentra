import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  CreateProjectMutation,
  CreateProjectMutationVariables,
} from './__generated__/create-project.mutation.generated';

export const CREATE_PROJECT_MUTATION: TypedDocumentNode<
  CreateProjectMutation,
  CreateProjectMutationVariables
> = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      workspaceId
      name
      description
    }
  }
`;
