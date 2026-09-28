import { GitBranch } from 'lucide-react';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty';
import { PageHeader } from '@/widgets/app-shell';

export const ProjectRepositoriesPage = () => (
  <>
    <PageHeader title='Repositories' />
    <Empty className='flex-1'>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <GitBranch />
        </EmptyMedia>
        <EmptyTitle>No repositories yet</EmptyTitle>
        <EmptyDescription>
          Repositories linked to this project will show up here.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  </>
);
