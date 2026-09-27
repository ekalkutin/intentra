import { useQuery } from '@apollo/client/react';
import { format } from 'date-fns';
import { KeyRound } from 'lucide-react';

import {
  PERSONAL_ACCESS_TOKENS_QUERY,
  TOKEN_STATUS,
  tokenStatus,
  type TokenStatus,
} from '@/entities/personal-access-token';
import { CreatePersonalAccessTokenDialog } from '@/features/create-personal-access-token';
import { RevokePersonalAccessTokenButton } from '@/features/revoke-personal-access-token';
import { Badge } from '@/shared/ui/badge';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty';
import { SettingsCard, SettingsTab } from '@/shared/ui/settings';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

const DATE_FORMAT = 'MMM d, yyyy';

const STATUS_BADGES: Record<
  TokenStatus,
  { label: string; variant: 'secondary' | 'outline' | 'destructive' }
> = {
  [TOKEN_STATUS.ACTIVE]: { label: 'Active', variant: 'secondary' },
  [TOKEN_STATUS.EXPIRED]: { label: 'Expired', variant: 'outline' },
  [TOKEN_STATUS.REVOKED]: { label: 'Revoked', variant: 'destructive' },
};

const formatDate = (iso: string | null, fallback: string) =>
  iso ? format(new Date(iso), DATE_FORMAT) : fallback;

const TokensTable = () => {
  const { data, loading } = useQuery(PERSONAL_ACCESS_TOKENS_QUERY);
  const tokens = data?.personalAccessTokens ?? [];

  if (loading && !data) {
    return <Skeleton className='h-32 w-full rounded-xl' />;
  }

  if (tokens.length === 0) {
    return (
      <Empty className='rounded-xl border border-dashed'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <KeyRound />
          </EmptyMedia>
          <EmptyTitle>No tokens yet</EmptyTitle>
          <EmptyDescription>
            Create one to connect an MCP agent such as Claude Desktop.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <SettingsCard>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='pl-4'>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='hidden sm:table-cell'>Created</TableHead>
            <TableHead className='hidden sm:table-cell'>Expires</TableHead>
            <TableHead className='pr-4'>
              <span className='sr-only'>Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokens.map(token => {
            const status = tokenStatus(token);
            const badge = STATUS_BADGES[status];
            return (
              <TableRow key={token.id}>
                <TableCell className='pl-4 font-medium'>{token.name}</TableCell>
                <TableCell>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </TableCell>
                <TableCell className='hidden text-muted-foreground sm:table-cell'>
                  {formatDate(token.createdAt, '')}
                </TableCell>
                <TableCell className='hidden text-muted-foreground sm:table-cell'>
                  {formatDate(token.expiresAt, 'Never')}
                </TableCell>
                <TableCell className='pr-4 text-right'>
                  {status === TOKEN_STATUS.ACTIVE ? (
                    <RevokePersonalAccessTokenButton token={token} />
                  ) : null}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </SettingsCard>
  );
};

export const ProfileAccessTokensTab = () => (
  <SettingsTab
    title='Access tokens'
    description='Personal access tokens let MCP agents act on your behalf.'
    actions={<CreatePersonalAccessTokenDialog />}
  >
    <TokensTable />
  </SettingsTab>
);
