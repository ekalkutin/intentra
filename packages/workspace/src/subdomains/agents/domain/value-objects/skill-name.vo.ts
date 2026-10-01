import { InvalidSkillException } from '../exceptions/index.js';

/** Intentra's own Skills start with it, so a Workspace's Skill can never clash with one. */
const PREFIX = 'intentra-';
/** Mastra's limit for a Skill's name. */
const PATTERN = /^intentra-[a-z0-9-]{1,55}$/;

/** A Skill's name, unique among Intentra's own Skills, such as `intentra-interviewing`. */
export class SkillName {
  readonly #value: string;

  constructor(value: string) {
    const name = value.trim();
    if (!PATTERN.test(name)) {
      throw new InvalidSkillException(
        `Skill name must start with "${PREFIX}" and have only a-z, 0-9 and "-", at most 64 characters`,
      );
    }
    this.#value = name;
  }

  public get value(): string {
    return this.#value;
  }

  public equals(other: SkillName): boolean {
    return other.value === this.#value;
  }
}
