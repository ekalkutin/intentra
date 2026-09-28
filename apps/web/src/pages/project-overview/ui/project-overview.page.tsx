import { useCurrentProject } from '@/entities/project';
import { PageHeader } from '@/widgets/app-shell';

export const ProjectOverviewPage = () => {
  const project = useCurrentProject();

  return (
    <>
      <PageHeader title={project.name} />
      <p className='px-4 text-body text-muted-foreground sm:px-6'>
        {project.description ?? 'No description yet.'}
      </p>
    </>
  );
};
