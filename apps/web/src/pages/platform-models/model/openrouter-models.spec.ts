import { describe, expect, it } from 'vitest';

import {
  canRunAgents,
  findOffers,
  PRICE_FILTERS,
  SORT_KEYS,
  toOffer,
  toStats,
  withStats,
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
  const offer = (id: string, inputPrice: number | null = null): ModelOffer => ({
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
    offer('y/cheap', 1),
    offer('x/router'),
    offer('x/costly', 10),
  ];

  it('orders by a price with unknown prices last', () => {
    // Act
    const found = findOffers(
      offers,
      {},
      {
        key: SORT_KEYS.inputPrice,
        ascending: true,
      },
    );

    // Assert
    expect(found.map(item => item.name)).toEqual([
      'y/cheap',
      'x/costly',
      'x/router',
    ]);
  });

  it('keeps unknown prices last in descending order too', () => {
    // Act
    const found = findOffers(
      offers,
      {},
      {
        key: SORT_KEYS.inputPrice,
        ascending: false,
      },
    );

    // Assert
    expect(found.map(item => item.name)).toEqual([
      'x/costly',
      'y/cheap',
      'x/router',
    ]);
  });

  it('finds by part of the id, ignoring case, by name', () => {
    // Act
    const found = findOffers(offers, { search: 'X/' });

    // Assert
    expect(found.map(item => item.name)).toEqual(['x/costly', 'x/router']);
  });

  it('lists everything by name without a search', () => {
    // Act
    const found = findOffers(offers, { search: ' ' });

    // Assert
    expect(found.map(item => item.name)).toEqual([
      'x/costly',
      'x/router',
      'y/cheap',
    ]);
  });
});

describe('findOffers filters', () => {
  const offer = (
    id: string,
    inputPrice: number | null,
    outputPrice: number | null,
  ): ModelOffer => ({
    id: `openrouter/${id}`,
    name: id,
    contextLength: null,
    inputPrice,
    outputPrice,
    maxOutputTokens: null,
    temperature: true,
    reasoning: false,
  });
  const offers = [
    offer('a/free', 0, 0),
    offer('b/paid', 1, 0),
    offer('c/router', null, null),
  ];

  it('keeps only models free both ways', () => {
    // Act
    const found = findOffers(offers, { price: PRICE_FILTERS.free });

    // Assert
    expect(found.map(item => item.name)).toEqual(['a/free']);
  });

  it('keeps models that cost anything, leaving out a router with no price', () => {
    // Act
    const found = findOffers(offers, { price: PRICE_FILTERS.paid });

    // Assert
    expect(found.map(item => item.name)).toEqual(['b/paid']);
  });

  it('keeps models at least as fast, leaving out unmeasured ones', () => {
    // Arrange
    const rows = withStats(
      offers,
      new Map([
        ['openrouter/a/free', { throughput: 40, latency: 400 }],
        ['openrouter/b/paid', { throughput: 120, latency: 2500 }],
      ]),
    );

    // Act
    const found = findOffers(rows, { minThroughput: 50 });

    // Assert
    expect(found.map(item => item.name)).toEqual(['b/paid']);
  });

  it('keeps models answering at least as soon, leaving out unmeasured ones', () => {
    // Arrange
    const rows = withStats(
      offers,
      new Map([
        ['openrouter/a/free', { throughput: 40, latency: 400 }],
        ['openrouter/b/paid', { throughput: 120, latency: 2500 }],
      ]),
    );

    // Act
    const found = findOffers(rows, { maxLatency: 1000 });

    // Assert
    expect(found.map(item => item.name)).toEqual(['a/free']);
  });
});

describe('toStats', () => {
  it('takes the fastest and the quickest providers that are up', () => {
    // Act
    const stats = toStats([
      {
        uptime_last_30m: 100,
        throughput_last_30m: { p50: 61.4 },
        latency_last_30m: { p50: 900 },
      },
      {
        uptime_last_30m: 0,
        throughput_last_30m: { p50: 300 },
        latency_last_30m: { p50: 100 },
      },
      { uptime_last_30m: 99, throughput_last_30m: 48, latency_last_30m: 650.4 },
    ]);

    // Assert
    expect(stats).toEqual({ throughput: 61, latency: 650 });
  });

  it('knows nothing when no provider says', () => {
    // Act
    const stats = toStats([
      { uptime_last_30m: 100, throughput_last_30m: null },
    ]);

    // Assert
    expect(stats).toEqual({ throughput: null, latency: null });
  });
});
