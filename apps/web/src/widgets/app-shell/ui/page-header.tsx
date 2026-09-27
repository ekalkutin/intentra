import type { ReactNode } from 'react';
import { generatePath, Link } from 'react-router';

import { useCurrentWorkspace } from '@/entities/workspace';
import { ROUTES } from '@/shared/config';
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
};

/** shadcn `sidebar-07` header: the sidebar toggle, then the breadcrumbs. */
export const PageHeader = ({ title, children }: PageHeaderProps) => {
  const workspace = useCurrentWorkspace();

  return (
    <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
      <div className='flex flex-1 items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1' />
        <Separator
          orientation='vertical'
          className='mr-2 data-vertical:h-4 data-vertical:self-auto'
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className='hidden md:block'>
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
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {children ? <div className='ml-auto'>{children}</div> : null}
      </div>
    </header>
  );
};
