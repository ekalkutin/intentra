import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  Button,
  Kbd,
  SidebarTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui';

import { IS_APPLE } from '../model/shortcut';

import { AccountMenu } from './account-menu';

/** The sidebar toggle, the search in the middle and the account on the right. */
export function AppHeader({ onSearch }: { readonly onSearch: () => void }) {
  const { t } = useTranslation();

  return (
    <header className='grid h-12 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-b border-border px-3'>
      <div>
        <Tooltip>
          <TooltipTrigger
            render={<SidebarTrigger aria-label={t('shell.toggleSidebar')} />}
          />
          <TooltipContent side='bottom' className='flex items-center gap-2'>
            {t('shell.toggleSidebar')}
            <Kbd>{IS_APPLE ? '⌘B' : 'Ctrl B'}</Kbd>
          </TooltipContent>
        </Tooltip>
      </div>
      <Button
        variant='outline'
        className='w-9 justify-center gap-2 px-0 text-muted-foreground md:w-80 md:justify-start md:px-2.5'
        onClick={onSearch}
        aria-label={t('shell.search')}
      >
        <Search />
        <span className='hidden flex-1 text-left font-normal md:inline'>
          {t('shell.searchPlaceholder')}
        </span>
        <Kbd className='hidden md:inline-flex'>
          {IS_APPLE ? '⌘K' : 'Ctrl K'}
        </Kbd>
      </Button>
      <div className='flex justify-end'>
        <AccountMenu />
      </div>
    </header>
  );
}
