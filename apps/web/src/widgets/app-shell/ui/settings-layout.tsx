import type { LucideIcon } from 'lucide-react';
import { generatePath, Link, Outlet, useMatch } from 'react-router';

import { useCurrentWorkspace } from '@/entities/workspace';
import { cn } from '@/shared/lib/utils';

import { PageHeader } from './page-header';

export type SettingsTabItem = {
  readonly label: string;
  readonly path: string;
  readonly icon: LucideIcon;
};

type SettingsLayoutProps = {
  /** The settings category: "Profile", "Workspace". */
  title: string;
  /** Vertical tabs, each a nested route; the active one renders in the outlet. */
  tabs: readonly SettingsTabItem[];
};

const SettingsTabLink = ({ tab }: { tab: SettingsTabItem }) => {
  const { alias } = useCurrentWorkspace();
  const isActive = useMatch({ path: tab.path, end: false }) !== null;
  const Icon = tab.icon;

  return (
    <li className='shrink-0'>
      <Link
        to={generatePath(tab.path, { alias })}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'flex min-h-8 items-center gap-2.5 rounded-lg px-3 py-1.5 text-body whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          isActive
            ? 'bg-surface-selected font-medium text-surface-selected-foreground'
            : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
        )}
      >
        <Icon aria-hidden='true' className='size-4 shrink-0' />
        {tab.label}
      </Link>
    </li>
  );
};

/**
 * One settings category: its tabs on the left (a row on phones) and the
 * active tab on the right. Every category page shares it.
 */
export const SettingsLayout = ({ title, tabs }: SettingsLayoutProps) => (
  <>
    <PageHeader section='Settings' title={title} />
    <div className='flex min-h-0 flex-1 flex-col md:flex-row'>
      <nav
        aria-label={`${title} settings`}
        className='shrink-0 border-b border-surface-border px-3 pb-3 md:w-56 md:border-r md:border-b-0 md:pb-6'
      >
        <ul className='flex gap-1 overflow-x-auto md:flex-col md:gap-px'>
          {tabs.map(tab => (
            <SettingsTabLink key={tab.path} tab={tab} />
          ))}
        </ul>
      </nav>
      <div className='min-w-0 flex-1 overflow-y-auto'>
        <div className='mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 md:px-10 md:py-8'>
          <Outlet />
        </div>
      </div>
    </div>
  </>
);
