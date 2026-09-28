import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  /** Page actions, on the right. */
  children?: ReactNode;
};

/** The page's title row, under the top bar that already says where you are. */
export const PageHeader = ({ title, children }: PageHeaderProps) => (
  <header className='flex min-h-16 shrink-0 items-center gap-3 px-4 sm:px-6'>
    <h1 className='min-w-0 truncate text-title font-semibold'>{title}</h1>
    {children ? <div className='ml-auto shrink-0'>{children}</div> : null}
  </header>
);
