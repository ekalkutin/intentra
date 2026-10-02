import { ChevronDown } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  FactChips,
  FIELD_CONTROLS,
  kindFields,
  KnowledgeKeyLink,
  KnowledgeMarkdown,
  useFieldTexts,
  type KindField,
} from '@/entities/knowledge-item';
import { cn } from '@/shared/lib';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  ListRow,
} from '@/shared/ui';
import type { KnowledgeItemDto } from '@intentra/contracts/workspace';

type Alternative = { alternative: string; reason: string | null };

/** Every filled field but the main one and the choices, which the chips carry. */
function detailsOf(item: KnowledgeItemDto): KindField[] {
  const { main, fields } = kindFields(item.kind);
  const values: Record<string, unknown> = item.fields;

  return fields.filter(
    field =>
      field.name !== main &&
      field.control !== FIELD_CONTROLS.choice &&
      filled(values[field.name]),
  );
}

/**
 * One Approved item as the Passport reads it, a row like Knowledge's: its key
 * and title, its statement, its short facts on the right; the rest of its
 * fields folded under the statement until asked for. Unfilled fields are
 * left out; the Knowledge page shows them as gaps.
 */
export function PassportEntry({ item }: { readonly item: KnowledgeItemDto }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const details = detailsOf(item);

  return (
    <ListRow className='py-3.5'>
      {/* The facts beside the text where there is room; under the statement, before its details, where not. */}
      <article
        aria-labelledby={`passport-${item.key}`}
        className='grid gap-x-8 sm:grid-cols-[minmax(0,1fr)_auto]'
      >
        <div className='min-w-0'>
          <h4
            id={`passport-${item.key}`}
            className='text-sm font-medium text-balance'
          >
            <KnowledgeKeyLink
              itemKey={item.key}
              className='mr-2 text-xs font-normal text-muted-foreground no-underline hover:text-foreground hover:underline'
            />
            {item.title}
          </h4>
          <KnowledgeMarkdown className='mt-1'>
            {item.mainField}
          </KnowledgeMarkdown>
        </div>
        <FactChips
          item={item}
          className='mt-2.5 sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:mt-0 sm:max-w-64 sm:content-start sm:justify-end'
        />
        {details.length > 0 && (
          <Collapsible
            open={open}
            onOpenChange={setOpen}
            className='min-w-0 sm:col-start-1'
          >
            <CollapsibleTrigger className='group/more mt-2 -ml-1 inline-flex h-6 items-center gap-1 rounded-md px-1 text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none'>
              {open ? t('passport.lessDetails') : t('passport.moreDetails')}
              <ChevronDown
                aria-hidden
                className='size-3.5 transition-transform duration-200 ease-out group-aria-expanded/more:rotate-180'
              />
            </CollapsibleTrigger>
            <CollapsibleContent className='h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none'>
              <Details item={item} fields={details} />
            </CollapsibleContent>
          </Collapsible>
        )}
      </article>
    </ListRow>
  );
}

/**
 * The Product Overview, the Passport's opening: its statement set larger as
 * the lead, then what it solves, for whom and what they get, each always in
 * view under its name.
 */
export function PassportOverview({
  item,
}: {
  readonly item: KnowledgeItemDto;
}) {
  const details = detailsOf(item);

  return (
    <article
      aria-labelledby={`passport-${item.key}`}
      className='rounded-lg border border-border bg-card px-4 py-4 sm:px-6 sm:py-5'
    >
      <div className='flex items-baseline justify-between gap-4'>
        <h3
          id={`passport-${item.key}`}
          className='min-w-0 text-sm font-medium text-balance'
        >
          {item.title}
        </h3>
        <KnowledgeKeyLink
          itemKey={item.key}
          className='shrink-0 text-xs text-muted-foreground no-underline hover:text-foreground hover:underline'
        />
      </div>
      <KnowledgeMarkdown className='mt-2 text-base leading-7 text-balance'>
        {item.mainField}
      </KnowledgeMarkdown>
      {details.length > 0 && <Details item={item} fields={details} />}
    </article>
  );
}

/** The fields under their names, the name in a column of its own where there is room. */
function Details({
  item,
  fields,
}: {
  readonly item: KnowledgeItemDto;
  readonly fields: readonly KindField[];
}) {
  const texts = useFieldTexts();
  const values: Record<string, unknown> = item.fields;

  return (
    <dl className='mt-3 flex flex-col border-t border-border'>
      {fields.map(field => (
        <Detail key={field.name} label={texts.label(item.kind, field.name)}>
          <DetailValue field={field} value={values[field.name]} />
        </Detail>
      ))}
    </dl>
  );
}

function filled(value: unknown): boolean {
  return Array.isArray(value)
    ? value.length > 0
    : typeof value === 'string' && value.length > 0;
}

function Detail({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <div className='grid gap-x-6 gap-y-1 border-b border-border py-3 last:border-b-0 last:pb-0 sm:grid-cols-[10rem_minmax(0,1fr)]'>
      <dt className='pt-0.5 text-xs leading-5 text-pretty text-muted-foreground'>
        {label}
      </dt>
      <dd className='min-w-0'>{children}</dd>
    </div>
  );
}

function DetailValue({
  field,
  value,
}: {
  readonly field: KindField;
  readonly value: unknown;
}) {
  if (field.control === FIELD_CONTROLS.alternatives) {
    return (
      <ul className='flex max-w-[68ch] flex-col gap-2 text-sm'>
        {(value as Alternative[]).map(({ alternative, reason }, index) => (
          <li key={index} className='flex flex-col gap-0.5'>
            <KnowledgeMarkdown>{alternative}</KnowledgeMarkdown>
            {reason && (
              <KnowledgeMarkdown className='text-muted-foreground'>
                {reason}
              </KnowledgeMarkdown>
            )}
          </li>
        ))}
      </ul>
    );
  }
  if (field.control === FIELD_CONTROLS.list) {
    const List = field.ordered ? 'ol' : 'ul';
    return (
      <List
        className={cn(
          'flex max-w-[68ch] flex-col gap-1 pl-5 text-sm leading-6',
          field.ordered
            ? 'list-decimal marker:font-mono marker:text-xs marker:text-muted-foreground'
            : 'list-disc marker:text-muted-foreground',
        )}
      >
        {(value as string[]).map((entry, index) => (
          <li key={index} className='pl-1'>
            <KnowledgeMarkdown>{entry}</KnowledgeMarkdown>
          </li>
        ))}
      </List>
    );
  }
  return <KnowledgeMarkdown>{String(value)}</KnowledgeMarkdown>;
}
