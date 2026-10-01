import { useCallback, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  knowledgeFilter,
  useKnowledgeItemsQuery,
  type InProject,
  type KnowledgeView,
} from '@/entities/knowledge-item';
import { toApiError } from '@/shared/api';
import { useDescribeError } from '@/shared/i18n';
import { useWhenNearViewport } from '@/shared/lib';
import { Button, LoadError, Spinner } from '@/shared/ui';
import type {
  KnowledgeItemDto,
  KnowledgeKindDto,
  KnowledgeListOrderDto,
} from '@intentra/contracts/workspace';

import { loadedParts, PAGE_SIZE, pageLength } from '../model/loaded-parts';

type Part = {
  readonly scope: InProject;
  readonly view: KnowledgeView;
  readonly kind: KnowledgeKindDto;
  readonly order: KnowledgeListOrderDto;
  /** How many items the part holds, from the summary. */
  readonly total: number;
  /** Names the part in `loadedParts`. */
  readonly part: string;
  /** Nothing is read until the part comes near the screen. */
  readonly active: boolean;
};

type Rendering = {
  readonly rows: (items: readonly KnowledgeItemDto[]) => ReactNode;
  readonly placeholder: (count: number) => ReactNode;
  /** A line of its own, such as the last one asking for the rest or a failure. */
  readonly more: (line: ReactNode) => ReactNode;
};

function argsFor(part: Part, index: number) {
  return {
    ...part.scope,
    filter: {
      ...knowledgeFilter(part.view, part.kind, part.order),
      take: PAGE_SIZE,
      offset: index * PAGE_SIZE,
    },
  };
}

/**
 * One Kind of a view, read a page at a time: each page draws placeholders of
 * its own length until it loads, and a last line reads the next page once it
 * comes near the screen (or when pressed).
 */
export function PagedPart(props: Part & Rendering) {
  const { t } = useTranslation();
  const [pages, setPages] = useState(() => loadedParts.pages(props.part));
  const last = useKnowledgeItemsQuery(argsFor(props, pages - 1), {
    skip: !props.active,
  });
  const remaining = Math.max(0, props.total - pages * PAGE_SIZE);
  const loadMore = useCallback(() => {
    setPages(count => {
      loadedParts.setPages(props.part, count + 1);
      return count + 1;
    });
  }, [props.part]);

  return (
    <>
      {Array.from({ length: pages }, (_, index) => (
        <PartPage key={index} part={props} index={index} rendering={props} />
      ))}
      {remaining > 0 &&
        props.more(
          <MoreLine
            label={t('knowledge.more', { count: remaining })}
            ready={Boolean(last.data)}
            onMore={loadMore}
          />,
        )}
    </>
  );
}

function PartPage({
  part,
  index,
  rendering,
}: {
  readonly part: Part;
  readonly index: number;
  readonly rendering: Rendering;
}) {
  const describeError = useDescribeError();
  const { data, error, refetch } = useKnowledgeItemsQuery(
    argsFor(part, index),
    { skip: !part.active },
  );
  const loadError = toApiError(error);

  if (loadError) {
    return rendering.more(
      <LoadError
        text={describeError(loadError).text}
        onRetry={() => void refetch()}
      />,
    );
  }

  return data
    ? rendering.rows(data.items)
    : rendering.placeholder(pageLength(part.total, index));
}

function MoreLine({
  label,
  ready,
  onMore,
}: {
  readonly label: string;
  readonly ready: boolean;
  readonly onMore: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useWhenNearViewport(ref, onMore, ready);

  return (
    <div ref={ref}>
      <Button
        variant='ghost'
        size='sm'
        disabled={!ready}
        onClick={onMore}
        className='text-muted-foreground'
      >
        {!ready && <Spinner />}
        {label}
      </Button>
    </div>
  );
}
