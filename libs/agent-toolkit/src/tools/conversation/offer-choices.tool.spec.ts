import { noopObserve } from '@mastra/core/tools';
import { describe, expect, it } from 'vitest';

import { ChoicesDtoSchema } from '@intentra/contracts/workspace';

import { offerChoicesTool } from './offer-choices.tool.js';

describe('offer_choices', () => {
  it('only acknowledges: the UI draws the cards from the call', async () => {
    // Arrange
    const input = {
      question: 'How much does it matter?',
      options: [
        { label: 'Must', description: null },
        { label: 'Should', description: null },
      ],
      multiple: false,
      allowCustom: true,
    };

    // Act
    const result = await offerChoicesTool.execute?.(input, {
      observe: noopObserve,
    });

    // Assert
    expect(result).toEqual({ shown: true });
  });

  it('needs at least two options', () => {
    // Act
    const parsed = ChoicesDtoSchema.safeParse({
      question: 'Which one?',
      options: [{ label: 'Only one' }],
    });

    // Assert
    expect(parsed.success).toBe(false);
  });
});
