import { KnowledgeKey } from './knowledge-key.vo.js';
import { KnowledgeLinkType } from './knowledge-link-type.vo.js';

/** A directed connection from the Knowledge Item that holds it to another, by its Knowledge Key. */
export class KnowledgeLink {
  readonly #type: KnowledgeLinkType;
  readonly #target: KnowledgeKey;

  constructor(type: KnowledgeLinkType, target: KnowledgeKey) {
    this.#type = type;
    this.#target = target;
  }

  public static from(props: KnowledgeLinkProps): KnowledgeLink {
    return new KnowledgeLink(
      KnowledgeLinkType.from(props.type),
      KnowledgeKey.parse(props.key),
    );
  }

  get type(): KnowledgeLinkType {
    return this.#type;
  }

  get target(): KnowledgeKey {
    return this.#target;
  }

  /** The same Link aimed at another target, such as the replacement of this one. */
  public aimedAt(target: KnowledgeKey): KnowledgeLink {
    return new KnowledgeLink(this.#type, target);
  }

  public equals(other: KnowledgeLink): boolean {
    return other.type.equals(this.#type) && other.target.equals(this.#target);
  }

  public toProps(): KnowledgeLinkProps {
    return { type: this.#type.value, key: this.#target.value };
  }
}

export type KnowledgeLinkProps = {
  readonly type: string;
  readonly key: string;
};
