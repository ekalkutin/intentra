import i18n from 'i18next';
import { describe, expect, it } from 'vitest';

import { initI18n } from '@/shared/i18n';
import {
  KNOWLEDGE_FIELDS_DTO_SCHEMAS,
  KnowledgeKindDtoSchema,
} from '@intentra/contracts/workspace';

import { FIELD_CONTROLS, kindFields } from './kind-fields';

initI18n();

describe('KIND_FIELDS', () => {
  it.each(KnowledgeKindDtoSchema.options)(
    'describes every field of %s, the main one first',
    kind => {
      // Arrange
      const schemaFields = Object.keys(
        KNOWLEDGE_FIELDS_DTO_SCHEMAS[kind].shape,
      ).sort();

      // Act
      const { main, fields } = kindFields(kind);

      // Assert
      expect(fields.map(field => field.name).sort()).toEqual(schemaFields);
      expect(fields[0]?.name).toBe(main);
    },
  );

  it.each(KnowledgeKindDtoSchema.options)(
    'has a Russian label for every field of %s and every choice',
    kind => {
      // Act
      const { fields } = kindFields(kind);

      // Assert
      for (const field of fields) {
        expect(i18n.exists(`knowledgeFields.${kind}.${field.name}`)).toBe(true);
        if (
          field.control === FIELD_CONTROLS.list ||
          field.control === FIELD_CONTROLS.alternatives
        ) {
          expect(i18n.exists(`knowledgeCounts.${field.name}_one`)).toBe(true);
        }
        for (const value of field.options ?? []) {
          expect(
            i18n.exists(`knowledgeOptions.${kind}.${field.name}.${value}`),
          ).toBe(true);
        }
      }
    },
  );
});
