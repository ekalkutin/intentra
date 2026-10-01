import { describe, expect, it } from 'vitest';

import {
  canRunAgents,
  findOffers,
  SORT_KEYS,
  toOffer,
  type ModelOffer,
} from './openrouter-models';

const TOOLS = ['tools', 'tool_choice', 'temperature'];

describe('canRunAgents', () => {
  it('takes a model that calls tools and answers in text', () => {
    // Act
    const capable = canRunAgents({
      id: 'anthropic/claude-sonnet-5',
      supported_parameters: TOOLS,
      architecture: { output_modalities: ['text'] },
    });

    // Assert
    expect(capable).toBe(true);
  });

  it('leaves out a model without tool calls', () => {
    // Act
    const capable = canRunAgents({
      id: 'some/model',
      supported_parameters: ['temperature'],
    });

    // Assert
    expect(capable).toBe(false);
  });

  it('leaves out a model that only draws', () => {
    // Act
    const capable = canRunAgents({
      id: 'some/painter',
      supported_parameters: TOOLS,
      architecture: { output_modalities: ['image'] },
    });

    // Assert
    expect(capable).toBe(false);
  });

  it('leaves out an alias the server would not take', () => {
    // Act
    const capable = canRunAgents({
      id: '~openai/gpt-latest',
      supported_parameters: TOOLS,
    });

    // Assert
    expect(capable).toBe(false);
  });
});

describe('toOffer', () => {
  it('gives the router id, prices per million tokens and what it takes', () => {
    // Act
    const offer = toOffer({
      id: 'anthropic/claude-sonnet-5',
      name: 'Anthropic: Claude Sonnet 5',
      context_length: 200_000,
      pricing: { prompt: '0.000003', completion: '-1' },
      top_provider: { max_completion_tokens: 64_000 },
      supported_parameters: TOOLS,
    });

    // Assert
    expect(offer).toEqual({
      id: 'openrouter/anthropic/claude-sonnet-5',
      name: 'Anthropic: Claude Sonnet 5',
      contextLength: 200_000,
      inputPrice: 3,
      outputPrice: null,
      maxOutputTokens: 64_000,
      temperature: true,
      reasoning: false,
    });
  });
});

describe('findOffers', () => {
  const offer = (id: string, inputPrice: number | null): ModelOffer => ({
    id: `openrouter/${id}`,
    name: id,
    contextLength: null,
    inputPrice,
    outputPrice: null,
    maxOutputTokens: null,
    temperature: true,
    reasoning: false,
  });
  const offers = [
    offer('x/costly', 10),
    offer('x/router', null),
    offer('y/cheap', 1),
  ];

  it('orders by a price with unknown prices last', () => {
    // Act
    const found = findOffers(offers, '', {
      key: SORT_KEYS.inputPrice,
      ascending: true,
    });

    // Assert
    expect(found.map(item => item.name)).toEqual([
      'y/cheap',
      'x/costly',
      'x/router',
    ]);
  });

  it('finds by part of the id, ignoring case', () => {
    // Act
    const found = findOffers(offers, 'X/', {
      key: SORT_KEYS.name,
      ascending: true,
    });

    // Assert
    expect(found.map(item => item.name)).toEqual(['x/costly', 'x/router']);
  });
});
