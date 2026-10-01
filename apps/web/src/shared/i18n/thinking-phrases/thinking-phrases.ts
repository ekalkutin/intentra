import { useTranslation } from 'react-i18next';

import { LanguageSchema, type Language } from '../language';

import { EN_THINKING_PHRASES } from './en';
import { RU_THINKING_PHRASES } from './ru';
import type { SystemTone, ThinkingPhrase } from './tone';

const PHRASES: Record<Language, readonly ThinkingPhrase[]> = {
  ru: RU_THINKING_PHRASES,
  en: EN_THINKING_PHRASES,
};

/** A language's phrases in a tone; Russian, the full language, when it has none. */
export function thinkingPhrases(
  language: Language,
  tone: SystemTone,
): readonly string[] {
  const inTone = (phrases: readonly ThinkingPhrase[]) =>
    phrases.filter(phrase => phrase.tone === tone).map(phrase => phrase.text);
  const own = inTone(PHRASES[language]);

  return own.length > 0 ? own : inTone(PHRASES.ru);
}

/** A random phrase other than the one shown, so the line never repeats itself. */
export function nextPhrase(
  phrases: readonly string[],
  current: string | null,
  random: () => number = Math.random,
): string {
  const others =
    phrases.length > 1 ? phrases.filter(phrase => phrase !== current) : phrases;
  return others[Math.floor(random() * others.length)] ?? '';
}

/** The phrases for the interface's language, in a tone. */
export function useThinkingPhrases(tone: SystemTone): readonly string[] {
  const { i18n } = useTranslation();
  const language = LanguageSchema.catch(LanguageSchema.enum.ru).parse(
    i18n.resolvedLanguage,
  );
  return thinkingPhrases(language, tone);
}
