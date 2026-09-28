import { Outlet } from 'react-router';

import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar';

import { AppSidebar } from './app-sidebar';
import { SiteHeader } from './site-header';

/**
 * shadcn `sidebar-16` layout: a sticky bar across the top, the sidebar under
 * it. `--header-height` is the bar's height; full-screen pages subtract it.
 */
export const AppShell = () => (
  <div className='[--header-height:--spacing(12)]'>
    <SidebarProvider className='flex flex-col'>
      <SiteHeader />
      <div className='flex flex-1'>
        <AppSidebar />
        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  </div>
);
