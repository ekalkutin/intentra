import type { ReactNode } from 'react';

import {
  ChoiceValue,
  FIELD_CONTROLS,
  kindFields,
  KnowledgeKeyLink,
  KnowledgeMarkdown,
  useFieldTexts,
  type KindField,
} from '@/entities/knowledge-item';
import type { KnowledgeItemDto } from '@intentra/contracts/workspace';

type Alternative = { alternative: string; reason: string | null };

/**
 * One Approved item as the Passport reads it: its title and key, its choices
 * in a line, its statement, then each other field it has under its name.
 * Unfilled fields are left out; the Knowledge page shows them as gaps.
 */
export function PassportEntry({ item }: { readonly item: KnowledgeItemDto }) {
  const texts = useFieldTexts();
  const { main, fields } = kindFields(item.kind);
  const values: Record<string, unknown> = item.fields;
  const choices = fields.filter(
    field =>
      field.control === FIELD_CONTROLS.choice &&
      typeof values[field.name] === 'string',
  );
  const details = fields.filter(
    field =>
      field.name !== main &&
      field.control !== FIELD_CONTROLS.choice &&
      filled(values[field.name]),
  );

  return (
    <article className='flex flex-col gap-2'>
      <div className='flex items-baseline justify-between gap-4'>
        <h4 className='min-w-0 text-sm font-medium text-pretty'>
          {item.title}
        </h4>
        <KnowledgeKeyLink
          itemKey={item.key}
          className='shrink-0 text-xs text-muted-foreground no-underline hover:text-foreground hover:underline'
        />
      </div>
      {choices.length > 0 && (
        <p className='-mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
          {choices.map(field => (
            <ChoiceValue
              key={field.name}
              kind={item.kind}
              field={field.name}
              value={values[field.name] as string}
            />
          ))}
        </p>
      )}
      <KnowledgeMarkdown>{item.mainField}</KnowledgeMarkdown>
      {details.map(field => (
        <Detail key={field.name} label={texts.label(item.kind, field.name)}>
          <DetailValue field={field} value={values[field.name]} />
        </Detail>
      ))}
    </article>
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
    <div className='mt-1 flex flex-col gap-1'>
      <h5 className='text-xs text-muted-foreground'>{label}</h5>
      {children}
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
      <ul className='flex max-w-[68ch] list-disc flex-col gap-1.5 pl-5 text-sm marker:text-muted-foreground'>
        {(value as Alternative[]).map(({ alternative, reason }, index) => (
          <li key={index} className='pl-1'>
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
        className={
          field.ordered
            ? 'flex max-w-[68ch] list-decimal flex-col gap-1 pl-5 text-sm marker:font-mono marker:text-xs marker:text-muted-foreground'
            : 'flex max-w-[68ch] list-disc flex-col gap-1 pl-5 text-sm marker:text-muted-foreground'
        }
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
