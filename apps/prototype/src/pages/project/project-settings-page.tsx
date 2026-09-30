import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { useDeleteProjectMutation } from '@/api/workspace-api';
import { ConfirmDialog, PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useProject } from '@/hooks/use-workspace';

export function ProjectSettingsPage() {
  const { workspaceId, projectId, project, projectAccess } = useProject();
  const [destroy] = useDeleteProjectMutation();
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  return (
    <div className='mx-auto max-w-3xl p-6 md:p-8'>
      <PageHeader title='Настройки проекта' />
      <div className='space-y-4'>
        <Card>
          <CardHeader>
            <CardTitle>{project?.name}</CardTitle>
            <CardDescription>
              Слаг <code>{project?.slug}</code> · id{' '}
              <code className='text-xs'>{projectId}</code>. Внешние агенты
              обращаются к проекту по его id.
            </CardDescription>
          </CardHeader>
        </Card>
        {projectAccess?.canDelete ? (
          <Card className='border-destructive/40'>
            <CardHeader>
              <CardTitle className='text-destructive'>Удалить проект</CardTitle>
              <CardDescription>
                Удаляет проект со всеми его знаниями и ролями.
              </CardDescription>
              <CardAction>
                <Button variant='destructive' onClick={() => setDeleting(true)}>
                  Удалить
                </Button>
              </CardAction>
            </CardHeader>
          </Card>
        ) : (
          <p className='text-sm text-muted-foreground'>
            Удалить проект может только Владелец или Менеджер, который его
            создал.
          </p>
        )}
      </div>
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={`Удалить «${project?.name}»?`}
        description='Все знания проекта будут удалены для всех.'
        confirmText={project?.slug}
        confirmLabel='Удалить проект'
        onConfirm={async () => {
          await destroy({
            workspaceId,
            projectId,
            slug: project?.slug ?? '',
          }).unwrap();
          toast.success('Проект удалён');
          navigate(`/w/${workspaceId}/projects`);
        }}
      />
    </div>
  );
}
