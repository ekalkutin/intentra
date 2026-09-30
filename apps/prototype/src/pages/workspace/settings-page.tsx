import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import {
  useDeleteWorkspaceMutation,
  useLeaveWorkspaceMutation,
} from '@/api/workspace-api';
import { ConfirmDialog, PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useWorkspace } from '@/hooks/use-workspace';

export function WorkspaceSettingsPage() {
  const { workspaceId, workspace, access } = useWorkspace();
  const [leave] = useLeaveWorkspaceMutation();
  const [destroy] = useDeleteWorkspaceMutation();
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  return (
    <div className='mx-auto max-w-3xl p-6 md:p-10'>
      <PageHeader title='Настройки' description={workspace?.name} />
      <div className='space-y-4'>
        <Card>
          <CardHeader>
            <CardTitle>Пространство</CardTitle>
            <CardDescription>
              Название <strong>{workspace?.name}</strong> · слаг{' '}
              <code>{workspace?.slug}</code>. Название и слаг задаются один раз.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Покинуть пространство</CardTitle>
            <CardDescription>
              Вы потеряете доступ ко всем его проектам. Ваши токены доступа
              будут отозваны.
            </CardDescription>
            <CardAction>
              <Button variant='outline' onClick={() => setLeaving(true)}>
                Покинуть
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
        {access?.canDeleteWorkspace && (
          <Card className='border-destructive/40'>
            <CardHeader>
              <CardTitle className='text-destructive'>
                Удалить пространство
              </CardTitle>
              <CardDescription>
                Удаляет все проекты, участников, приглашения и все знания.
                Отменить это нельзя.
              </CardDescription>
              <CardAction>
                <Button variant='destructive' onClick={() => setDeleting(true)}>
                  Удалить
                </Button>
              </CardAction>
            </CardHeader>
          </Card>
        )}
      </div>
      <ConfirmDialog
        open={leaving}
        onOpenChange={setLeaving}
        title={`Покинуть «${workspace?.name}»?`}
        confirmLabel='Покинуть пространство'
        onConfirm={async () => {
          await leave({ workspaceId }).unwrap();
          toast.success(`Вы покинули «${workspace?.name}»`);
          navigate('/');
        }}
      />
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={`Удалить «${workspace?.name}»?`}
        description='Всё содержимое пространства будет удалено для всех.'
        confirmText={workspace?.slug}
        confirmLabel='Удалить пространство'
        onConfirm={async () => {
          await destroy({ workspaceId, slug: workspace?.slug ?? '' }).unwrap();
          toast.success('Пространство удалено');
          navigate('/');
        }}
      />
    </div>
  );
}
