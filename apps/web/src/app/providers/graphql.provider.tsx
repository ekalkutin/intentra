import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import type { PropsWithChildren } from 'react';

import { GRAPHQL_URL } from '@/shared/config';

const client = new ApolloClient({
  link: new HttpLink({ uri: GRAPHQL_URL }),
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
