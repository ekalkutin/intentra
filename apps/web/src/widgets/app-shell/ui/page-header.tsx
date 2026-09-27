import type { ReactNode } from 'react';
import { generatePath, Link } from 'react-router';

import { useCurrentWorkspace } from '@/entities/workspace';
import { ROUTES } from '@/shared/config';
import { cn } from '@/shared/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb';
import { Separator } from '@/shared/ui/separator';
import { SidebarTrigger } from '@/shared/ui/sidebar';

type PageHeaderProps = {
  title: string;
  /** Page actions, on the right. */
  children?: ReactNode;
  className?: string;
};

/** The sidebar toggle lives here, before the breadcrumbs, on every page. */
export const PageHeader = ({ title, children, className }: PageHeaderProps) => {
  const workspace = useCurrentWorkspace();

  return (
    <header
      className={cn(
        'flex h-12 shrink-0 items-center gap-2 border-b px-4',
        className,
      )}
    >
      <SidebarTrigger className='-ml-1' />
      <Separator
        orientation='vertical'
        className='mr-1 data-vertical:h-4 data-vertical:self-center'
      />
      <Breadcrumb className='min-w-0 flex-1'>
        <BreadcrumbList>
          <BreadcrumbItem className='hidden md:inline-flex'>
            <BreadcrumbLink
              render={
                <Link
                  to={generatePath(ROUTES.WORKSPACE.ROOT, {
                    alias: workspace.alias,
                  })}
                />
              }
            >
              {workspace.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className='hidden md:block' />
          <BreadcrumbItem>
            <BreadcrumbPage className='font-medium'>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {children}
    </header>
  );
};
