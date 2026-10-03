import type { ParseKeys } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { KnowledgeKindDto } from '@intentra/contracts/workspace';

export type FieldTexts = {
  readonly label: (kind: KnowledgeKindDto, field: string) => string;
  /** What to write in the field, or null when its label says enough. */
  readonly hint: (kind: KnowledgeKindDto, field: string) => string | null;
  readonly option: (
    kind: KnowledgeKindDto,
    field: string,
    value: string,
  ) => string;
  /** Whether `value` is one of the field's choices, with a text of its own. */
  readonly hasOption: (
    kind: KnowledgeKindDto,
    field: string,
    value: string,
  ) => boolean;
};

/**
 * The texts of each Kind's fields: `knowledgeFields.<kind>.<field>`, hints in
 * `knowledgeHints`, choices in `knowledgeOptions`. The keys are built from the
 * field descriptions, so a unit test checks that every one has its text.
 */
export function useFieldTexts(): FieldTexts {
  const { i18n } = useTranslation();

  return useMemo(() => {
    const text = (key: string) => i18n.t(key as ParseKeys);

    return {
      label: (kind, field) => text(`knowledgeFields.${kind}.${field}`),
      hint: (kind, field) => {
        const key = `knowledgeHints.${kind}.${field}`;
        return i18n.exists(key) ? text(key) : null;
      },
      option: (kind, field, value) =>
        text(`knowledgeOptions.${kind}.${field}.${value}`),
      hasOption: (kind, field, value) =>
        i18n.exists(`knowledgeOptions.${kind}.${field}.${value}`),
    };
  }, [i18n]);
}
