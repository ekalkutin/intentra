import { Bot } from 'lucide-react';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty';
import { PageHeader } from '@/widgets/app-shell';

export const AgentsPage = () => (
  <>
    <PageHeader title='Agents' />
    <Empty className='flex-1'>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <Bot />
        </EmptyMedia>
        <EmptyTitle>No agents yet</EmptyTitle>
        <EmptyDescription>
          Agent profiles of this workspace will show up here.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  </>
);
