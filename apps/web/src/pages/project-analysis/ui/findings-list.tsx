import { Check, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import {
  KindIcon,
  KnowledgeKeyLink,
  useKnowledgeScope,
} from '@/entities/knowledge-item';
import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui';
import {
  KnowledgeKindDtoSchema,
  KnowledgeStatusDtoSchema,
} from '@intentra/contracts/workspace';

import type { Finding } from '../model/findings';

/** How many findings show before "Ещё N". */
const SHOWN = 3;

const { approved, rejected, obsolete } = KnowledgeStatusDtoSchema.enum;

/**
 * The Open Questions a run recorded: each led by the Open Question's mark,
 * its key and the question itself. Waiting for a decision is the default and
 * goes unsaid; only what the team settled says so, quietly.
 */
export function FindingsList({
  findings,
}: {
  readonly findings: readonly Finding[];
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const shown = open ? findings : findings.slice(0, SHOWN);
  const hidden = findings.length - SHOWN;

  return (
    <div className='mt-2.5 -mx-2'>
      <ul className='flex flex-col'>
        {shown.map(finding => (
          <FindingRow key={finding.key} finding={finding} />
        ))}
      </ul>
      {hidden > 0 && (
        <Button
          variant='ghost'
          size='sm'
          className='mt-0.5 text-muted-foreground hover:text-foreground'
          aria-expanded={open}
          onClick={() => setOpen(current => !current)}
        >
          {open
            ? t('analysis.showFewer')
            : t('analysis.showMore', { count: hidden })}
          <ChevronDown
            className={cn(
              'transition-transform duration-200 ease-out',
              open && 'rotate-180',
            )}
          />
        </Button>
      )}
    </div>
  );
}

function FindingRow({ finding }: { readonly finding: Finding }) {
  const { t } = useTranslation();
  const scope = useKnowledgeScope();
  const settled =
    finding.status !== null &&
    finding.status !== KnowledgeStatusDtoSchema.enum.draft;
  const faded =
    finding.status === rejected ||
    finding.status === obsolete ||
    finding.title === null;

  return (
    <li className='group/finding relative flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-muted/70 has-focus-visible:bg-muted/70'>
      <KindIcon
        kind={KnowledgeKindDtoSchema.enum['open-question']}
        className={cn('size-4 shrink-0', faded && 'opacity-50')}
      />
      <KnowledgeKeyLink
        itemKey={finding.key}
        className='relative z-10 w-12 shrink-0 text-xs text-muted-foreground no-underline hover:text-foreground'
      />
      {finding.title ? (
        <Link
          to={scope.itemPath(finding.key)}
          className={cn(
            'line-clamp-2 min-w-0 flex-1 text-sm outline-none after:absolute after:inset-0 after:rounded-md sm:truncate',
            faded ? 'text-muted-foreground' : 'text-foreground',
          )}
        >
          {finding.title}
        </Link>
      ) : (
        <span className='min-w-0 flex-1 truncate text-sm text-muted-foreground'>
          {t('analysis.findingGone')}
        </span>
      )}
      {settled && finding.status && (
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1 text-xs',
            finding.status === approved
              ? 'text-success'
              : 'text-muted-foreground',
          )}
        >
          {finding.status === approved && <Check className='size-3.5' />}
          {finding.status === rejected && <X className='size-3.5' />}
          {t(`analysis.findingStatuses.${finding.status}`)}
        </span>
      )}
    </li>
  );
}
