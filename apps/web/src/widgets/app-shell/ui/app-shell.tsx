import { Outlet } from 'react-router';

import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar';

import { AppSidebar } from './app-sidebar';

export const AppShell = () => (
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <Outlet />
    </SidebarInset>
  </SidebarProvider>
);
