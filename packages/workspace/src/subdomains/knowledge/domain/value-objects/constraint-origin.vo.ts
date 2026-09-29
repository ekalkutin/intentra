import { InvalidKnowledgeFieldsException } from '../exceptions/index.js';

/** Where a Constraint is imposed from. */
export class ConstraintOrigin {
  public static readonly Law = new ConstraintOrigin('law');
  public static readonly Budget = new ConstraintOrigin('budget');
  public static readonly Deadline = new ConstraintOrigin('deadline');
  public static readonly Customer = new ConstraintOrigin('customer');
  public static readonly Company = new ConstraintOrigin('company');
  public static readonly Infrastructure = new ConstraintOrigin(
    'infrastructure',
  );

  static readonly #all: readonly ConstraintOrigin[] = [
    ConstraintOrigin.Law,
    ConstraintOrigin.Budget,
    ConstraintOrigin.Deadline,
    ConstraintOrigin.Customer,
    ConstraintOrigin.Company,
    ConstraintOrigin.Infrastructure,
  ];

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public static from(value: string): ConstraintOrigin {
    const choice = ConstraintOrigin.#all.find(
      candidate => candidate.value === value,
    );
    if (!choice) {
      throw new InvalidKnowledgeFieldsException();
    }

    return choice;
  }

  public get value(): string {
    return this.#value;
  }
}
