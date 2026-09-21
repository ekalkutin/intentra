import { BellIcon, FileTextIcon, SearchIcon } from 'lucide-react';

import { Button } from '@/shared/ui/primitives/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/primitives/empty';
import { SidebarTrigger } from '@/shared/ui/primitives/sidebar';

export function DashboardPage() {
  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <header className='flex h-12 shrink-0 items-center gap-2 border-b border-border px-3 sm:px-4'>
        <SidebarTrigger className='md:hidden' />
        <div className='min-w-0 flex-1'>
          <h1 className='truncate text-sm font-semibold'>Overview</h1>
        </div>
        <Button variant='ghost' size='icon-sm' aria-label='Search'>
          <SearchIcon />
        </Button>
        <Button variant='ghost' size='icon-sm' aria-label='Notifications'>
          <BellIcon />
        </Button>
      </header>

      <section className='flex min-h-0 flex-1 flex-col overflow-auto'>
        <Empty className='border-0'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <FileTextIcon />
            </EmptyMedia>
            <EmptyTitle>No evidence yet</EmptyTitle>
            <EmptyDescription>
              Add a source, note, or finding to start building a decision trail.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>Add evidence</Button>
          </EmptyContent>
        </Empty>
      </section>
    </div>
  );
}
