import { Mail, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import {
  useInvitationsQuery,
  useInviteMutation,
  useRevokeInvitationMutation,
} from '@/api/workspace-api';
import {
  EmptyState,
  ErrorAlert,
  ListSkeleton,
  PageHeader,
  Spinner,
} from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useWorkspace } from '@/hooks/use-workspace';
import { errorMessage } from '@/lib/errors';
import { formatDate, formatRelative } from '@/lib/format';
import type { InvitationStatusDto } from '@intentra/contracts/workspace';

const STATUS_VARIANT: Record<
  InvitationStatusDto,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  pending: 'default',
  accepted: 'secondary',
  declined: 'outline',
  revoked: 'outline',
  expired: 'outline',
};

const STATUS_LABEL: Record<InvitationStatusDto, string> = {
  pending: 'ожидает',
  accepted: 'принято',
  declined: 'отклонено',
  revoked: 'отозвано',
  expired: 'истекло',
};

export function InvitationsPage() {
  const { workspaceId } = useWorkspace();
  const invitations = useInvitationsQuery({ workspaceId });
  const [invite, inviteState] = useInviteMutation();
  const [revoke] = useRevokeInvitationMutation();
  const [email, setEmail] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await invite({ workspaceId, email: email.trim() }).unwrap();
      toast.success(`Приглашение отправлено на ${email}`);
      setEmail('');
    } catch {
      // Shown from the mutation state.
    }
  };

  return (
    <div className='mx-auto max-w-4xl p-6 md:p-10'>
      <PageHeader
        title='Приглашения'
        description='Приглашайте людей по email. Они увидят приглашение, когда войдут с этим адресом.'
      />
      <Card className='mb-6'>
        <CardContent>
          <form onSubmit={submit} className='flex flex-col gap-2 sm:flex-row'>
            <Input
              type='email'
              required
              placeholder='teammate@company.com'
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Button type='submit' disabled={inviteState.isLoading}>
              {inviteState.isLoading ? <Spinner /> : <Send />}
              Пригласить
            </Button>
          </form>
          <ErrorAlert error={inviteState.error} className='mt-3' />
        </CardContent>
      </Card>
      <ErrorAlert error={invitations.error} />
      {invitations.isLoading ? (
        <ListSkeleton />
      ) : invitations.data?.length ? (
        <div className='rounded-xl border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Отправлено</TableHead>
                <TableHead>Истекает</TableHead>
                <TableHead className='w-24' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.data.map(invitation => (
                <TableRow key={invitation.id}>
                  <TableCell className='font-medium'>
                    {invitation.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[invitation.status]}>
                      {STATUS_LABEL[invitation.status]}
                    </Badge>
                  </TableCell>
                  <TableCell title={formatDate(invitation.sentAt)}>
                    {formatRelative(invitation.sentAt)}
                  </TableCell>
                  <TableCell title={formatDate(invitation.expiresAt)}>
                    {formatRelative(invitation.expiresAt)}
                  </TableCell>
                  <TableCell>
                    {invitation.status === 'pending' && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={async () => {
                          try {
                            await revoke({
                              workspaceId,
                              invitationId: invitation.id,
                            }).unwrap();
                            toast.success('Приглашение отозвано');
                          } catch (error) {
                            toast.error(errorMessage(error));
                          }
                        }}
                      >
                        Отозвать
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState icon={Mail} title='Приглашений пока нет' />
      )}
    </div>
  );
}
