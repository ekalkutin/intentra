import { TooltipProvider } from '@/shared/ui/tooltip';

import { AppRouterProvider, GraphQLProvider } from './providers';

export const App = () => (
  <GraphQLProvider>
    <TooltipProvider>
      <AppRouterProvider />
    </TooltipProvider>
  </GraphQLProvider>
);
