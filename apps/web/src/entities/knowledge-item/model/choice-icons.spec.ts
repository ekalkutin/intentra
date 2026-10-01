import { Gauge, SquareFunction } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { KnowledgeKindDtoSchema } from '@intentra/contracts/workspace';

import { choiceIconOf } from './choice-icons';
import { FIELD_CONTROLS, kindFields } from './kind-fields';
import { priorityOf } from './priority';

describe('choiceIconOf', () => {
  it("gives each of a Requirement's types its icon", () => {
    // Act
    const icons = [
      choiceIconOf('requirement', 'type', 'functional'),
      choiceIconOf('requirement', 'type', 'non-functional'),
    ];

    // Assert
    expect(icons).toEqual([SquareFunction, Gauge]);
  });

  it('covers every choice the contracts allow, the priority aside', () => {
    // Arrange
    const choices = KnowledgeKindDtoSchema.options.flatMap(kind =>
      kindFields(kind)
        .fields.filter(field => field.control === FIELD_CONTROLS.choice)
        .flatMap(field =>
          (field.options ?? []).map(value => ({
            kind,
            field: field.name,
            value,
          })),
        ),
    );

    // Act
    const missing = choices.filter(
      ({ kind, field, value }) =>
        priorityOf(kind, field, value) === null &&
        choiceIconOf(kind, field, value) === null,
    );

    // Assert
    expect(choices.length).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  });

  it('knows no icon for a value outside the contracts', () => {
    // Act
    const icon = choiceIconOf('integration', 'direction', 'sideways');

    // Assert
    expect(icon).toBeNull();
  });
});
