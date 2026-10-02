import type { ReactElement, ReactNode } from 'react';

import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui';

/**
 * A secondary action of the page's header as an outline icon button, its
 * name told by a tooltip and to assistive technology; the decision itself
 * keeps its words.
 */
export function IconAction({
  label,
  render,
  nativeButton = false,
  onClick,
  disabled,
  className,
  children,
}: {
  readonly label: string;
  /** What the button renders as, such as a router link or a sheet's trigger. */
  readonly render?: ReactElement;
  /** Whether what it renders as is itself a button (a sheet's trigger), not a link. */
  readonly nativeButton?: boolean;
  readonly onClick?: () => void;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant='outline'
            size='icon'
            aria-label={label}
            onClick={onClick}
            disabled={disabled}
            className={className}
            {...(render && { render, nativeButton })}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
