import { ChevronDown, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { newKnowledgeItemPath } from '@/shared/config';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/ui';
import {
  KnowledgeKindDtoSchema,
  type KnowledgeKindDto,
} from '@intentra/contracts/workspace';

/** Records a new Draft by hand: the Kinds the person may record, in the model's order. */
export function RecordMenu({
  workspaceSlug,
  projectSlug,
  kinds,
  wide = false,
}: {
  readonly workspaceSlug: string;
  readonly projectSlug: string;
  readonly kinds: readonly KnowledgeKindDto[];
  /** Fills its column, as the first line of the side column. */
  readonly wide?: boolean;
}) {
  const { t } = useTranslation();
  const allowed = KnowledgeKindDtoSchema.options.filter(kind =>
    kinds.includes(kind),
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className={wide ? 'w-full justify-start' : undefined}>
            <Plus />
            <span className={wide ? 'flex-1 text-left' : undefined}>
              {t('knowledge.record')}
            </span>
            <ChevronDown data-icon='inline-end' />
          </Button>
        }
      />
      <DropdownMenuContent align={wide ? 'start' : 'end'} className='min-w-60'>
        <DropdownMenuGroup>
          <DropdownMenuLabel className='font-normal text-muted-foreground'>
            {t('knowledge.recordKind')}
          </DropdownMenuLabel>
          {allowed.map(kind => (
            <DropdownMenuItem
              key={kind}
              render={
                <Link
                  to={newKnowledgeItemPath(workspaceSlug, projectSlug, kind)}
                />
              }
            >
              {t(`kindsOne.${kind}`)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
