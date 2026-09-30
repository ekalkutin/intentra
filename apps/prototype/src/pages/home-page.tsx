import { Building2, Check, Mail, Plus, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';

import {
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
  useReceivedInvitationsQuery,
  useWorkspacesQuery,
} from '@/api/workspace-api';
import {
  EmptyState,
  ErrorAlert,
  ListSkeleton,
  PageHeader,
} from '@/components/common';
import { UserMenu } from '@/components/layout/user-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CreateWorkspaceDialog } from '@/features/workspace/create-dialogs';
import { errorMessage } from '@/lib/errors';
import { formatRelative } from '@/lib/format';

export function HomePage() {
  const workspaces = useWorkspacesQuery();
  const invitations = useReceivedInvitationsQuery();
  const [accept] = useAcceptInvitationMutation();
  const [decline] = useDeclineInvitationMutation();
  const [creating, setCreating] = useState(false);
  const pending = invitations.data?.filter(i => i.status === 'pending') ?? [];

  const act = async (
    run: () => Promise<unknown>,
    success: string,
  ): Promise<void> => {
    try {
      await run();
      toast.success(success);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <div className='min-h-svh bg-muted/30'>
      <header className='border-b bg-background'>
        <div className='mx-auto flex h-14 max-w-5xl items-center justify-between px-4'>
          <div className='flex items-center gap-2 font-semibold'>
            <div className='flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground'>
              <Sparkles className='size-4' />
            </div>
            Intentra
          </div>
          <div className='flex items-center gap-1'>
            <ThemeToggle />
            <UserMenu compact />
          </div>
        </div>
      </header>
      <main className='mx-auto max-w-5xl space-y-10 px-4 py-10'>
        {pending.length > 0 && (
          <section className='space-y-3'>
            <h2 className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
              <Mail className='size-4' /> Приглашения для вас
            </h2>
            <div className='grid gap-3 sm:grid-cols-2'>
              {pending.map(invitation => (
                <Card key={invitation.id} className='py-4'>
                  <CardHeader className='flex flex-row items-center justify-between gap-3 px-4'>
                    <div className='min-w-0'>
                      <CardTitle className='truncate'>
                        {invitation.workspaceName}
                      </CardTitle>
                      <CardDescription>
                        Истекает {formatRelative(invitation.expiresAt)}
                      </CardDescription>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() =>
                          act(
                            () => decline(invitation.id).unwrap(),
                            'Приглашение отклонено',
                          )
                        }
                      >
                        <X /> Отклонить
                      </Button>
                      <Button
                        size='sm'
                        onClick={() =>
                          act(
                            () => accept(invitation.id).unwrap(),
                            `Вы вступили в «${invitation.workspaceName}»`,
                          )
                        }
                      >
                        <Check /> Принять
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section>
          <PageHeader
            title='Пространства'
            description='Пространство объединяет людей, их проекты и всё, что о них известно.'
            actions={
              <Button onClick={() => setCreating(true)}>
                <Plus /> Новое пространство
              </Button>
            }
          />
          <ErrorAlert error={workspaces.error} />
          {workspaces.isLoading ? (
            <ListSkeleton rows={3} />
          ) : workspaces.data?.length ? (
            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              {workspaces.data.map(workspace => (
                <Link key={workspace.id} to={`/w/${workspace.id}`}>
                  <Card className='transition-colors hover:border-foreground/20 hover:bg-accent/40'>
                    <CardHeader>
                      <div className='mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary'>
                        {workspace.name.charAt(0).toUpperCase()}
                      </div>
                      <CardTitle>{workspace.name}</CardTitle>
                      <CardDescription className='font-mono text-xs'>
                        {workspace.slug}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              title='Пространств пока нет'
              description='Создайте своё или примите приглашение от коллеги.'
              action={
                <Button onClick={() => setCreating(true)}>
                  <Plus /> Новое пространство
                </Button>
              }
            />
          )}
        </section>
      </main>
      <CreateWorkspaceDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}
