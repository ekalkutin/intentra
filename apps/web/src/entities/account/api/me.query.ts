import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  MeQuery,
  MeQueryVariables,
} from './__generated__/me.query.generated';

export const ME_QUERY: TypedDocumentNode<MeQuery, MeQueryVariables> = gql`
  query Me {
    me {
      id
      email
      displayName
    }
  }
`;
