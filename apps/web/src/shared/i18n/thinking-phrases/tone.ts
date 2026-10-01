/** How the system speaks in its small talk, such as what it says while thinking. */
export const SYSTEM_TONES = {
  /** Light and joking: the default. */
  playful: 'playful',
  /** Plain and businesslike. */
  serious: 'serious',
} as const;

export type SystemTone = (typeof SYSTEM_TONES)[keyof typeof SYSTEM_TONES];

/** Until a Workspace chooses one. */
export const DEFAULT_TONE: SystemTone = SYSTEM_TONES.playful;

/** One thing the system may say while it thinks, in one tone. */
export type ThinkingPhrase = {
  readonly tone: SystemTone;
  /** Without the trailing ellipsis: the status line adds it. */
  readonly text: string;
};
