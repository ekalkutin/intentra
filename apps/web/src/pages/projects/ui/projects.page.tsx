import { FolderKanban } from 'lucide-react';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty';
import { PageHeader } from '@/widgets/app-shell';

export const ProjectsPage = () => (
  <>
    <PageHeader title='Projects' />
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
  </>
);
