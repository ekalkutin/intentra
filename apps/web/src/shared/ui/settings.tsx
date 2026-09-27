import { cn } from 'cn';
import { useId, type ReactNode } from 'react';

import { Card, CardContent } from '@/shared/ui/card';

/** Laid out after multica's settings: a tab is sections of cards of rows. */
function SettingsTab({
  title,
  description,
  actions,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  /** Page-level action, aligned with the title. */
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div data-slot='settings-tab' className='flex flex-col gap-8'>
      <header className='flex min-w-0 items-start gap-4'>
        <div className='min-w-0 flex-1'>
          <h2 className='text-title-lg font-semibold tracking-tight'>
            {title}
          </h2>
          {description ? (
            <p className='mt-1 max-w-2xl text-body text-muted-foreground'>
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className='shrink-0'>{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}

function SettingsSection({
  title,
  description,
  action,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  const headingId = useId();

  return (
    <section
      data-slot='settings-section'
      aria-labelledby={title ? headingId : undefined}
      className='flex flex-col gap-3'
    >
      {title || description || action ? (
        <div className='flex min-w-0 items-end justify-between gap-4 px-0.5'>
          <div className='min-w-0'>
            {title ? (
              <h3 id={headingId} className='text-body font-semibold'>
                {title}
              </h3>
            ) : null}
            {description ? (
              <p className='mt-1 text-caption text-muted-foreground'>
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className='shrink-0'>{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

function SettingsCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card
      data-slot='settings-card'
      className={cn('gap-0 py-0 shadow-none', className)}
    >
      <CardContent className='divide-y divide-surface-border px-0'>
        {children}
      </CardContent>
    </Card>
  );
}

/**
 * Width of the control column. Text controls in one card share `text` so
 * their edges line up; a narrower tier must read as intentional.
 */
const SETTINGS_CONTROL_WIDTHS = {
  text: 'sm:w-80',
  select: 'sm:w-48',
} as const;

function SettingsRow({
  label,
  description,
  size,
  className,
  children,
}: {
  label: ReactNode;
  description?: ReactNode;
  /** Omit for content-hugging controls: buttons, switches. */
  size?: keyof typeof SETTINGS_CONTROL_WIDTHS;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-slot='settings-row'
      className={cn(
        'flex min-h-16 gap-4 px-4 py-3.5 sm:items-center sm:justify-between sm:gap-8',
        size ? 'flex-col sm:flex-row' : 'flex-row items-center justify-between',
        className,
      )}
    >
      <div className='min-w-0 flex-1'>
        <div className='text-body font-medium'>{label}</div>
        {description ? (
          <div className='mt-0.5 text-caption text-muted-foreground'>
            {description}
          </div>
        ) : null}
      </div>
      <div
        className={cn(
          'shrink-0',
          size ? ['w-full', SETTINGS_CONTROL_WIDTHS[size]] : 'w-auto',
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Actions under the rows of a card: a form's save button. */
function SettingsCardFooter({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-slot='settings-card-footer'
      className={cn(
        'flex items-center justify-end gap-3 bg-surface px-4 py-3',
        className,
      )}
    >
      {children}
    </div>
  );
}

export {
  SettingsCard,
  SettingsCardFooter,
  SettingsRow,
  SettingsSection,
  SettingsTab,
};
