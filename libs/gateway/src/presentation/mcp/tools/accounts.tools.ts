import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

import { AccountDtoSchema, type AccountsApi } from '@intentra/iam-contracts';

export function registerAccountTools(
  server: McpServer,
  accountsApi: AccountsApi,
): void {
  server.registerTool(
    'find-accounts',
    {
      description: 'List all accounts',
      inputSchema: z.object({}),
      // Structured output must be an object, so the list is wrapped.
      outputSchema: z.object({ accounts: z.array(AccountDtoSchema) }),
    },
    async () => {
      const accounts = await accountsApi.find();
      return {
        content: [{ type: 'text', text: JSON.stringify(accounts) }],
        structuredContent: { accounts },
      };
    },
  );
}
