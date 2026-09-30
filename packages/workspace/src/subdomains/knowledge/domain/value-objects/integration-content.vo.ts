import { IntegrationDirection } from './integration-direction.vo.js';
import { KnowledgeKind } from './knowledge-kind.vo.js';
import { KnowledgeText } from './knowledge-text.vo.js';

/** The fields of an Integration; its purpose is the main field. */
export class IntegrationContent {
  readonly #purpose: KnowledgeText;
  readonly #externalSystem: KnowledgeText | null;
  readonly #direction: IntegrationDirection | null;
  readonly #exchanged: KnowledgeText | null;

  constructor(props: IntegrationFields) {
    this.#purpose = new KnowledgeText(props.purpose);
    this.#externalSystem = KnowledgeText.optional(props.externalSystem);
    this.#direction =
      props.direction === null
        ? null
        : IntegrationDirection.from(props.direction);
    this.#exchanged = KnowledgeText.optional(props.exchanged);
  }

  get kind(): KnowledgeKind {
    return KnowledgeKind.Integration;
  }

  get mainField(): KnowledgeText {
    return this.#purpose;
  }

  public toFields(): IntegrationFields {
    return {
      purpose: this.#purpose.value,
      externalSystem: this.#externalSystem?.value ?? null,
      direction: this.#direction?.value ?? null,
      exchanged: this.#exchanged?.value ?? null,
    };
  }
}

export type IntegrationFields = {
  readonly purpose: string;
  readonly externalSystem: string | null;
  readonly direction: string | null;
  readonly exchanged: string | null;
};
