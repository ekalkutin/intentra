import { FolderKanban, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { useProjectsQuery } from '@/api/workspace-api';
import {
  EmptyState,
  ErrorAlert,
  ListSkeleton,
  PageHeader,
} from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CreateProjectDialog } from '@/features/workspace/create-dialogs';
import { ProjectRoleBadge } from '@/features/workspace/role-badges';
import { useWorkspace } from '@/hooks/use-workspace';

export function ProjectsPage() {
  const { workspaceId, access, workspace } = useWorkspace();
  const projects = useProjectsQuery({ workspaceId });
  const [creating, setCreating] = useState(false);
  const canCreate = access?.canCreateProjects ?? false;

  return (
    <div className='mx-auto max-w-5xl p-6 md:p-10'>
      <PageHeader
        title='Проекты'
        description={
          workspace
            ? `Всё, что известно о каждом продукте в пространстве «${workspace.name}».`
            : undefined
        }
        actions={
          canCreate && (
            <Button onClick={() => setCreating(true)}>
              <Plus /> Новый проект
            </Button>
          )
        }
      />
      <ErrorAlert error={projects.error} />
      {projects.isLoading ? (
        <ListSkeleton />
      ) : projects.data?.length ? (
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {projects.data.map(project => {
            const projectAccess = access?.projects[project.id];
            return (
              <Link key={project.id} to={`/w/${workspaceId}/p/${project.id}`}>
                <Card className='h-full transition-colors hover:border-foreground/20 hover:bg-accent/40'>
                  <CardHeader>
                    <div className='mb-2 flex items-start justify-between'>
                      <FolderKanban className='size-5 text-muted-foreground' />
                      {projectAccess && (
                        <ProjectRoleBadge role={projectAccess.role} />
                      )}
                    </div>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription className='font-mono text-xs'>
                      {project.slug}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title='Проектов пока нет'
          description={
            canCreate
              ? 'Создайте проект, затем расскажите о продукте ассистенту или внесите знания вручную.'
              : 'Создавать проекты могут только Владелец или Менеджер.'
          }
          action={
            canCreate && (
              <Button onClick={() => setCreating(true)}>
                <Plus /> Новый проект
              </Button>
            )
          }
        />
      )}
      {access?.role && (
        <p className='mt-6 text-xs text-muted-foreground'>
          Ваша роль в пространстве:{' '}
          <Badge variant='outline'>
            {access.role === 'owner' ? 'Владелец' : 'Менеджер'}
          </Badge>
        </p>
      )}
      <CreateProjectDialog
        workspaceId={workspaceId}
        open={creating}
        onOpenChange={setCreating}
      />
    </div>
  );
}
