import { InvalidAnalysisRunException } from '../exceptions/index.js';

/** What an Analysis Run looks at. */
export class AnalysisRunScope {
  /** The Unchecked Drafts and Approved items: a run by hand or by the schedule. */
  public static readonly Unchecked = new AnalysisRunScope('unchecked');
  /** Every Draft and Approved item, checked or not: a run a Maintainer starts by hand. */
  public static readonly WholeProject = new AnalysisRunScope('whole-project');
  /** Runs from before runs went item by item, over what was approved or retired since the last one; read as Unchecked. */
  static readonly #legacyChanges = 'changes';

  static readonly #all: readonly AnalysisRunScope[] = [
    AnalysisRunScope.Unchecked,
    AnalysisRunScope.WholeProject,
  ];

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public static from(value: string): AnalysisRunScope {
    if (value === AnalysisRunScope.#legacyChanges) {
      return AnalysisRunScope.Unchecked;
    }
    const scope = AnalysisRunScope.#all.find(
      candidate => candidate.value === value,
    );
    if (!scope) {
      throw new InvalidAnalysisRunException(
        'Analysis Run scope must be unchecked or whole-project',
      );
    }

    return scope;
  }

  public get value(): string {
    return this.#value;
  }

  public equals(other: AnalysisRunScope): boolean {
    return this.#value === other.#value;
  }
}
