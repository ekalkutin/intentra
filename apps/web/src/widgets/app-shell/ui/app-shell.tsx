import type { ReactNode } from 'react';
import { Outlet } from 'react-router';

import { SidebarInset, SidebarProvider } from '@/shared/ui/primitives/sidebar';

import { AppSidebar } from './app-sidebar';

export function AppShell({ children }: { children?: ReactNode }) {
  return (
    <SidebarProvider className='h-dvh min-h-dvh bg-app-shell'>
      <AppSidebar />
      <SidebarInset className='relative min-w-0 overflow-hidden bg-page-canvas'>
        {children ?? <Outlet />}
      </SidebarInset>
    </SidebarProvider>
  );
}
