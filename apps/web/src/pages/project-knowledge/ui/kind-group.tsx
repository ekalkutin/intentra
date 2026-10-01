import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import {
  KindIcon,
  type InProject,
  type KnowledgeListState,
  type KnowledgeView,
} from '@/entities/knowledge-item';
import { useNearViewport } from '@/shared/lib';
import { List, ListSkeleton } from '@/shared/ui';
import type {
  KnowledgeKindDto,
  KnowledgeListOrderDto,
  MemberDto,
} from '@intentra/contracts/workspace';

import { loadedParts } from '../model/loaded-parts';

import { KnowledgeRow } from './knowledge-row';
import { PagedPart } from './paged-part';

/**
 * One Kind of the view under its heading. Nothing is read, and (through
 * `content-visibility`) nothing is drawn, until the group comes near the
 * screen.
 */
export function KindGroup({
  scope,
  view,
  kind,
  total,
  pathOf,
  state,
  order,
  memberOf,
}: {
  readonly scope: InProject;
  readonly view: KnowledgeView;
  readonly kind: KnowledgeKindDto;
  readonly total: number;
  readonly pathOf: (key: string) => string;
  readonly state: KnowledgeListState;
  readonly order: KnowledgeListOrderDto;
  readonly memberOf: (memberId: string) => MemberDto | undefined;
}) {
  const { t } = useTranslation();
  const part = `${scope.projectId}:${view}:${kind}:${order}`;
  const ref = useRef<HTMLElement>(null);
  const near = useNearViewport(ref, { initial: loadedParts.wasSeen(part) });

  useEffect(() => {
    if (near) {
      loadedParts.markSeen(part);
    }
  }, [near, part]);

  return (
    <section
      ref={ref}
      aria-labelledby={`${part}-heading`}
      className='flex flex-col gap-1 [contain-intrinsic-size:auto_20rem] [content-visibility:auto]'
    >
      <h2
        id={`${part}-heading`}
        // Stays on top while its items scroll by, until the next Kind takes its place.
        className='sticky top-0 z-10 -mx-1 flex items-center gap-2 bg-background px-1 py-2 text-sm font-semibold'
      >
        <KindIcon kind={kind} />
        {t(`kinds.${kind}`)}
        <span className='font-mono font-normal text-muted-foreground tabular-nums'>
          {total}
        </span>
      </h2>
      <List>
        <PagedPart
          scope={scope}
          view={view}
          kind={kind}
          order={order}
          total={total}
          part={part}
          active={near}
          rows={items =>
            items.map(item => (
              <KnowledgeRow
                key={item.id}
                item={item}
                to={pathOf(item.key)}
                state={state}
                memberOf={memberOf}
              />
            ))
          }
          placeholder={count => <ListSkeleton rows={count} />}
          more={line => <li className='px-2 py-1.5'>{line}</li>}
        />
      </List>
    </section>
  );
}
