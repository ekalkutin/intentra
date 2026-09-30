import { InvalidKnowledgeKeyException } from '../exceptions/index.js';

import { KnowledgeKind } from './knowledge-kind.vo.js';

const SHAPE = /^([A-Z]+)-([1-9][0-9]*)$/;

/**
 * A Knowledge Item's name within its Project, such as `REQ-12`: its Kind's
 * prefix and a number counted per Kind. Never changes and is never reused.
 */
export class KnowledgeKey {
  readonly #kind: KnowledgeKind;
  readonly #number: number;

  constructor(kind: KnowledgeKind, number: number) {
    if (!Number.isSafeInteger(number) || number < 1) {
      throw new InvalidKnowledgeKeyException();
    }
    this.#kind = kind;
    this.#number = number;
  }

  public static parse(value: string): KnowledgeKey {
    const [, prefix, number] = SHAPE.exec(value) ?? [];
    if (!prefix || !number) {
      throw new InvalidKnowledgeKeyException();
    }

    return new KnowledgeKey(KnowledgeKind.fromPrefix(prefix), Number(number));
  }

  public get kind(): KnowledgeKind {
    return this.#kind;
  }

  public get number(): number {
    return this.#number;
  }

  public get value(): string {
    return `${this.#kind.prefix}-${this.#number}`;
  }

  public equals(other: KnowledgeKey): boolean {
    return other.value === this.value;
  }
}
