import { describe, expect, it } from 'vitest';

import { EN_THINKING_PHRASES } from './en';
import { RU_THINKING_PHRASES } from './ru';
import { nextPhrase, thinkingPhrases } from './thinking-phrases';
import { SYSTEM_TONES } from './tone';

/** The most words a phrase may have, so the status stays short. */
const WORDS_MAX = 3;

describe('thinkingPhrases', () => {
  it('gives about fifty playful phrases in each language', () => {
    // Act
    const ru = thinkingPhrases('ru', SYSTEM_TONES.playful);
    const en = thinkingPhrases('en', SYSTEM_TONES.playful);

    // Assert
    expect(ru.length).toBeGreaterThanOrEqual(50);
    expect(en.length).toBeGreaterThanOrEqual(50);
  });

  it('keeps every phrase to one, two or three words', () => {
    // Act
    const long = [...RU_THINKING_PHRASES, ...EN_THINKING_PHRASES].filter(
      phrase => phrase.text.split(/\s+/).length > WORDS_MAX,
    );

    // Assert
    expect(long).toEqual([]);
  });

  it('keeps each language free of repeats', () => {
    // Act
    const lists = [RU_THINKING_PHRASES, EN_THINKING_PHRASES].map(phrases =>
      phrases.map(phrase => phrase.text),
    );

    // Assert
    for (const texts of lists) {
      expect(new Set(texts).size).toBe(texts.length);
    }
  });

  it('gives only the asked tone', () => {
    // Act
    const serious = thinkingPhrases('ru', SYSTEM_TONES.serious);

    // Assert
    expect(serious).toContain('Анализирую');
    expect(serious).not.toContain('Шуршу');
  });
});

describe('nextPhrase', () => {
  it('never repeats the phrase shown', () => {
    // Act
    const next = nextPhrase(['A', 'B'], 'A', () => 0);

    // Assert
    expect(next).toBe('B');
  });

  it('keeps the only phrase there is', () => {
    // Act
    const next = nextPhrase(['A'], 'A', () => 0.5);

    // Assert
    expect(next).toBe('A');
  });
});
