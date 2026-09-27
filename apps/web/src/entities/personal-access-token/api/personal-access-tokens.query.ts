import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  PersonalAccessTokensQuery,
  PersonalAccessTokensQueryVariables,
} from './__generated__/personal-access-tokens.query.generated';

export const PERSONAL_ACCESS_TOKENS_QUERY: TypedDocumentNode<
  PersonalAccessTokensQuery,
  PersonalAccessTokensQueryVariables
> = gql`
  query PersonalAccessTokens {
    personalAccessTokens {
      id
      name
      createdAt
      expiresAt
      revokedAt
    }
  }
`;
