import { InvalidPublishingNoteException } from '../exceptions/index.js';

import { trimmedWithin } from './text.js';

const MAX_LENGTH = 500;

/** Why an Agents Version was published, in a few words. */
export class PublishingNote {
  readonly #value: string;

  constructor(value: string) {
    const text = trimmedWithin(value, MAX_LENGTH);
    if (text === null) {
      throw new InvalidPublishingNoteException(MAX_LENGTH);
    }
    this.#value = text;
  }

  public get value(): string {
    return this.#value;
  }
}
