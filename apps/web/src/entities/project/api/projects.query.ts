import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  ProjectsQuery,
  ProjectsQueryVariables,
} from './__generated__/projects.query.generated';

/** Projects of every workspace the account is a member of. */
export const PROJECTS_QUERY: TypedDocumentNode<
  ProjectsQuery,
  ProjectsQueryVariables
> = gql`
  query Projects {
    projects {
      id
      workspaceId
      name
      description
    }
  }
`;
