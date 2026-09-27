import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { ApolloProvider } from '@apollo/client/react';
import type { PropsWithChildren } from 'react';

import { GRAPHQL_URL } from '@/shared/config';
import { readAccessToken } from '@/shared/session';

const authLink = new SetContextLink(prevContext => {
  const token = readAccessToken();
  return {
    headers: {
      ...prevContext.headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

const client = new ApolloClient({
  link: ApolloLink.from([authLink, new HttpLink({ uri: GRAPHQL_URL })]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    },
    query: { fetchPolicy: 'network-only' },
  },
});

export const GraphQLProvider = ({ children }: PropsWithChildren) => (
  <ApolloProvider client={client}>{children}</ApolloProvider>
);
