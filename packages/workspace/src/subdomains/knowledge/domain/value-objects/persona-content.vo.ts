import { KnowledgeKind } from './knowledge-kind.vo.js';
import { KnowledgeText } from './knowledge-text.vo.js';
import { PersonaType } from './persona-type.vo.js';

/** The fields of a Persona; its profile is the main field. */
export class PersonaContent {
  readonly #profile: KnowledgeText;
  readonly #type: PersonaType | null;
  readonly #needs: readonly KnowledgeText[];

  constructor(props: PersonaFields) {
    this.#profile = new KnowledgeText(props.profile);
    this.#type = props.type === null ? null : PersonaType.from(props.type);
    this.#needs = props.needs.map(need => new KnowledgeText(need));
  }

  get kind(): KnowledgeKind {
    return KnowledgeKind.Persona;
  }

  get mainField(): KnowledgeText {
    return this.#profile;
  }

  /** A person or a system; `null` when not said. */
  get type(): PersonaType | null {
    return this.#type;
  }

  public toFields(): PersonaFields {
    return {
      profile: this.#profile.value,
      type: this.#type?.value ?? null,
      needs: this.#needs.map(need => need.value),
    };
  }
}

export type PersonaFields = {
  readonly profile: string;
  readonly type: string | null;
  readonly needs: readonly string[];
};
