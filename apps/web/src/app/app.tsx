import { AppRouterProvider, GraphQLProvider } from './providers';

export const App = () => (
  <GraphQLProvider>
    <AppRouterProvider />
  </GraphQLProvider>
);
