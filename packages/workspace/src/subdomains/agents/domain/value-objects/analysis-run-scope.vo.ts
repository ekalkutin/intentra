import { InvalidAnalysisRunException } from '../exceptions/index.js';

/** What an Analysis Run looks at. */
export class AnalysisRunScope {
  /** Every Approved Knowledge Item of the Project: a run started by hand. */
  public static readonly WholeProject = new AnalysisRunScope('whole-project');

  static readonly #all: readonly AnalysisRunScope[] = [
    AnalysisRunScope.WholeProject,
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
        'Analysis Run scope must be whole-project',
      );
    }

    return scope;
  }

  public get value(): string {
    return this.#value;
  }
}
