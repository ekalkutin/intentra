import { Outlet } from 'react-router';

import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar';

import { AppSidebar } from './app-sidebar';
import { SidebarShortcut } from './sidebar-shortcut';

export const AppShell = () => (
  <SidebarProvider className='h-svh bg-app-shell'>
    <SidebarShortcut />
    <AppSidebar />
    <SidebarInset className='relative overflow-hidden'>
      <Outlet />
    </SidebarInset>
  </SidebarProvider>
);
