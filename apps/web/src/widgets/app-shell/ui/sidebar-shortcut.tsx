import { useEffect } from 'react';

import { useSidebar } from '@/shared/ui/sidebar';

const TOGGLE_KEY = 'b';

/** ⌘B / Ctrl+B toggles the sidebar, as in stock shadcn; the sidebar itself no longer binds it. */
export const SidebarShortcut = () => {
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === TOGGLE_KEY && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleSidebar]);

  return null;
};
