import { InvalidAnalysisRunException } from '../exceptions/index.js';

/** What an Analysis Run looks at. */
export class AnalysisRunScope {
  /** Every Approved Knowledge Item of the Project: a run started by hand. */
  public static readonly WholeProject = new AnalysisRunScope('whole-project');
  /** What was approved or retired since the last completed run: a run the schedule started. */
  public static readonly Changes = new AnalysisRunScope('changes');

  static readonly #all: readonly AnalysisRunScope[] = [
    AnalysisRunScope.WholeProject,
    AnalysisRunScope.Changes,
  ];

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public static from(value: string): AnalysisRunScope {
    const scope = AnalysisRunScope.#all.find(
      candidate => candidate.value === value,
    );
    if (!scope) {
      throw new InvalidAnalysisRunException(
        'Analysis Run scope must be whole-project or changes',
      );
    }

    return scope;
  }

  public get value(): string {
    return this.#value;
  }
}
