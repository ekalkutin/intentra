import { ChevronRight, FolderKanban } from 'lucide-react';
import { generatePath, Link } from 'react-router';

import { useWorkspaceProjects } from '@/entities/project';
import { useCurrentWorkspace } from '@/entities/workspace';
import { CreateProjectDialog } from '@/features/create-project';
import { ROUTES } from '@/shared/config';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/shared/ui/item';
import { Skeleton } from '@/shared/ui/skeleton';
import { PageHeader } from '@/widgets/app-shell';

export const ProjectsPage = () => {
  const workspace = useCurrentWorkspace();
  const { projects, loading } = useWorkspaceProjects(workspace.id);

  return (
    <>
      <PageHeader title='Projects'>
        <CreateProjectDialog />
      </PageHeader>
      {loading ? (
        <div className='mx-auto w-full max-w-3xl px-4 pb-8'>
          <Skeleton className='h-40 w-full rounded-xl' />
        </div>
      ) : projects.length === 0 ? (
        <Empty className='flex-1'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <FolderKanban />
            </EmptyMedia>
            <EmptyTitle>No projects yet</EmptyTitle>
            <EmptyDescription>
              Projects of this workspace will show up here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className='mx-auto w-full max-w-3xl px-4 pb-8'>
          <ItemGroup className='gap-3'>
            {projects.map(project => (
              <Item
                key={project.id}
                variant='outline'
                render={
                  <Link
                    to={generatePath(ROUTES.WORKSPACE.PROJECT.ROOT, {
                      alias: workspace.alias,
                      projectId: project.id,
                    })}
                  />
                }
              >
                <ItemMedia variant='icon'>
                  <FolderKanban />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{project.name}</ItemTitle>
                  {project.description ? (
                    <ItemDescription>{project.description}</ItemDescription>
                  ) : null}
                </ItemContent>
                <ItemActions>
                  <ChevronRight className='size-4 text-muted-foreground' />
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </div>
      )}
    </>
  );
};
