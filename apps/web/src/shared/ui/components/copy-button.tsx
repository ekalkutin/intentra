import { Check, Copy } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useCopy } from '@/shared/lib';

import { Button } from '../primitives/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../primitives/tooltip';

/** An icon that copies a text, named by its tooltip; it turns into a check once copied. */
export function CopyButton({
  text,
  label,
  icon = <Copy />,
}: {
  readonly text: string;
  /** What is copied, such as "Copy the address". */
  readonly label: string;
  readonly icon?: ReactNode;
}) {
  const { t } = useTranslation();
  const { copied, copy } = useCopy();
  const shown = copied ? t('common.copied') : label;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant='ghost'
            size='icon-sm'
            aria-label={shown}
            className='text-muted-foreground'
            onClick={() => void copy(text)}
          />
        }
      >
        {copied ? <Check /> : icon}
      </TooltipTrigger>
      <TooltipContent>{shown}</TooltipContent>
    </Tooltip>
  );
}
