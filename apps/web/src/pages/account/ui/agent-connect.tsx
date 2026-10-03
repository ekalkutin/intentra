import { Braces, Link2, SquareTerminal } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  MCP_CLIENTS,
  mcpConnectionName,
  mcpSetup,
  mcpUrl,
  type McpClient,
  type McpConnection,
  type McpSetup,
} from '@/entities/personal-access-token';
import { CopyButton, List } from '@/shared/ui';

const SETUP_LABELS = {
  command: 'tokens.copyCommand',
  config: 'tokens.copyConfig',
  details: 'tokens.copyDetails',
} as const satisfies Record<McpSetup['kind'], string>;

const SETUP_ICONS = {
  command: <SquareTerminal />,
  config: <Braces />,
  details: <Link2 />,
} as const satisfies Record<McpSetup['kind'], ReactNode>;

/**
 * How to connect an agent with the new token, a row per client: a prompt to
 * paste into the agent, which then connects itself, and what sets the client
 * up by hand. Both carry the whole secret, so they work as copied.
 */
export function AgentConnect({
  workspaceSlug,
  secret,
}: {
  readonly workspaceSlug: string;
  readonly secret: string;
}) {
  const { t } = useTranslation();
  const connection: McpConnection = {
    name: mcpConnectionName(workspaceSlug),
    url: mcpUrl(workspaceSlug),
    secret,
  };

  return (
    <section className='flex min-w-0 flex-col gap-3'>
      <div className='flex flex-col gap-0.5'>
        <h3 className='text-sm font-medium'>{t('tokens.connectTitle')}</h3>
        <p className='text-sm text-pretty text-muted-foreground'>
          {t('tokens.connectDescription')}
        </p>
      </div>
      <List>
        {MCP_CLIENTS.map(client => (
          <ClientRow key={client} client={client} connection={connection} />
        ))}
      </List>
    </section>
  );
}

function ClientRow({
  client,
  connection,
}: {
  readonly client: McpClient;
  readonly connection: McpConnection;
}) {
  const { t } = useTranslation();
  const setup = mcpSetup(client, connection);
  const prompt = [
    t(`tokens.prompts.${client}`, {
      name: connection.name,
      setup: setup.text,
    }),
    t('tokens.promptAfter'),
  ].join('\n\n');

  return (
    <li className='flex items-center gap-3 py-1.5 pr-1.5 pl-3'>
      <span className='min-w-0 flex-1 truncate text-sm font-medium sm:w-28 sm:flex-none'>
        {t(`tokens.clients.${client}`)}
      </span>
      {/* What the row carries, at a glance: the same text both copies hold. */}
      <span className='hidden min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground sm:block'>
        {setup.text}
      </span>
      <span className='flex shrink-0 items-center gap-0.5'>
        <CopyButton
          text={setup.text}
          label={t(SETUP_LABELS[setup.kind])}
          icon={SETUP_ICONS[setup.kind]}
        />
        <CopyButton text={prompt} label={t('tokens.copyPrompt')} />
      </span>
    </li>
  );
}
