import type { TFunction } from 'i18next';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { KnowledgeKeyLink } from '@/entities/knowledge-item';
import {
  KnowledgeLinkTypeDtoSchema,
  type KnowledgeItemDto,
} from '@intentra/contracts/workspace';

/** Its Links sit above the row's cover link, so each opens its own target. */
const KEY_CLASS = 'relative z-10';

/**
 * Below a row: what the item rests on, its Links grouped by meaning, then
 * what it replaces and what replaced it.
 */
export function RowLinks({ item }: { readonly item: KnowledgeItemDto }) {
  const { t } = useTranslation();
  const relations = relationsOf(item, t);

  if (relations.length === 0) {
    return null;
  }

  return (
    <p className='mt-2.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs leading-5 text-muted-foreground'>
      {relations.map(relation => (
        <span key={relation.label}>
          {relation.label}{' '}
          {relation.keys.map((key, index) => (
            <Fragment key={key}>
              {index > 0 && ', '}
              <KnowledgeKeyLink itemKey={key} className={KEY_CLASS} />
            </Fragment>
          ))}
        </span>
      ))}
    </p>
  );
}

type Relation = { readonly label: string; readonly keys: readonly string[] };

/** The item's Links grouped by type in the model's order, then what it replaces and what replaced it. */
function relationsOf(item: KnowledgeItemDto, t: TFunction): Relation[] {
  const relations: Relation[] = KnowledgeLinkTypeDtoSchema.options
    .map(type => ({
      label: t(`linkTypes.${type}`),
      keys: item.links.filter(link => link.type === type).map(link => link.key),
    }))
    .filter(relation => relation.keys.length > 0);
  if (item.supersedes) {
    relations.push({
      label: t('knowledge.replaces'),
      keys: [item.supersedes],
    });
  }
  if (item.supersededByKey) {
    relations.push({
      label: t('knowledge.replacedBy'),
      keys: [item.supersededByKey],
    });
  }
  return relations;
}
