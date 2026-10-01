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
}: {
  readonly workspaceSlug: string;
  readonly projectSlug: string;
  readonly kinds: readonly KnowledgeKindDto[];
}) {
  const { t } = useTranslation();
  const allowed = KnowledgeKindDtoSchema.options.filter(kind =>
    kinds.includes(kind),
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant='outline'>
            <Plus />
            {t('knowledge.record')}
            <ChevronDown data-icon='inline-end' />
          </Button>
        }
      />
      <DropdownMenuContent align='end' className='min-w-60'>
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
