import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';
import { SidebarTrigger, useSidebarSafe } from '@/shared/ui/sidebar';

/** Brings the sidebar back once it has collapsed on a narrower window. */
const CollapsedNavTrigger = () => {
  const sidebar = useSidebarSafe();
  if (!sidebar || sidebar.hasExternalTrigger) return null;
  return <SidebarTrigger className='xl:hidden' />;
};

type PageHeaderProps = {
  children: ReactNode;
  className?: string;
};

export const PageHeader = ({ children, className }: PageHeaderProps) => (
  <header
    className={cn(
      'flex h-12 shrink-0 items-center gap-2 border-b px-4',
      className,
    )}
  >
    <CollapsedNavTrigger />
    {children}
  </header>
);
