import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ChoiceValue,
  FIELD_CONTROLS,
  kindFields,
  KnowledgeMarkdown,
  useFieldTexts,
  type KindField,
} from '@/entities/knowledge-item';
import type {
  KnowledgeItemDto,
  KnowledgeKindDto,
} from '@intentra/contracts/workspace';

/**
 * What the item says: what its Kind is for, each field under its name (texts
 * as Markdown, Knowledge Keys in them opening their items), then why it is
 * believed. An empty field stays in view as a gap to fill.
 */
export function ItemFields({ item }: { readonly item: KnowledgeItemDto }) {
  const { t } = useTranslation();
  const texts = useFieldTexts();
  const values: Record<string, unknown> = item.fields;

  return (
    <div className='flex flex-col gap-6 rounded-lg border border-border bg-card p-4 sm:p-6'>
      <p className='text-xs text-muted-foreground'>
        {t(`kindDescriptions.${item.kind}`)}
      </p>
      {kindFields(item.kind).fields.map(field => (
        <FieldSection
          key={field.name}
          label={texts.label(item.kind, field.name)}
        >
          <FieldValue
            kind={item.kind}
            field={field}
            value={values[field.name]}
          />
        </FieldSection>
      ))}
      <div className='border-t border-border pt-6'>
        <FieldSection label={t('knowledgeItem.rationale')}>
          {item.rationale ? (
            <KnowledgeMarkdown className='text-muted-foreground'>
              {item.rationale}
            </KnowledgeMarkdown>
          ) : (
            <Gap>{t('knowledgeItem.noRationale')}</Gap>
          )}
        </FieldSection>
      </div>
    </div>
  );
}

function FieldSection({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <section className='flex flex-col gap-1.5'>
      <h3 className='text-xs font-medium text-muted-foreground'>{label}</h3>
      {children}
    </section>
  );
}

function Gap({ children }: { readonly children: ReactNode }) {
  return <p className='text-sm text-muted-foreground'>{children}</p>;
}

function FieldValue({
  kind,
  field,
  value,
}: {
  readonly kind: KnowledgeKindDto;
  readonly field: KindField;
  readonly value: unknown;
}) {
  const { t } = useTranslation();
  const gap = <Gap>{t('knowledgeItem.notFilled')}</Gap>;

  if (field.control === FIELD_CONTROLS.alternatives) {
    const alternatives = value as {
      alternative: string;
      reason: string | null;
    }[];
    if (alternatives.length === 0) {
      return gap;
    }
    return (
      <ul className='flex flex-col divide-y divide-border rounded-lg border border-border'>
        {alternatives.map(({ alternative, reason }, index) => (
          <li key={index} className='flex flex-col gap-1 px-3 py-2.5'>
            <KnowledgeMarkdown className='font-medium'>
              {alternative}
            </KnowledgeMarkdown>
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
    const entries = value as string[];
    if (entries.length === 0) {
      return gap;
    }
    const List = field.ordered ? 'ol' : 'ul';
    return (
      <List
        className={
          field.ordered
            ? 'flex max-w-[68ch] list-decimal flex-col gap-1.5 pl-5 marker:font-mono marker:text-xs marker:text-muted-foreground'
            : 'flex max-w-[68ch] list-disc flex-col gap-1.5 pl-5 marker:text-muted-foreground'
        }
      >
        {entries.map((entry, index) => (
          <li key={index} className='pl-1'>
            <KnowledgeMarkdown>{entry}</KnowledgeMarkdown>
          </li>
        ))}
      </List>
    );
  }
  if (typeof value !== 'string' || value.length === 0) {
    return gap;
  }
  if (field.control === FIELD_CONTROLS.choice) {
    return (
      <p className='text-sm'>
        <ChoiceValue kind={kind} field={field.name} value={value} />
      </p>
    );
  }

  return <KnowledgeMarkdown>{value}</KnowledgeMarkdown>;
}
