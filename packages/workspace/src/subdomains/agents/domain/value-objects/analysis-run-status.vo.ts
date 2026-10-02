import { InvalidAnalysisRunException } from '../exceptions/index.js';

/** Where an Analysis Run stands: running until it completes or fails. */
export class AnalysisRunStatus {
  public static readonly Running = new AnalysisRunStatus('running');
  public static readonly Completed = new AnalysisRunStatus('completed');
  public static readonly Failed = new AnalysisRunStatus('failed');

  static readonly #all: readonly AnalysisRunStatus[] = [
    AnalysisRunStatus.Running,
    AnalysisRunStatus.Completed,
    AnalysisRunStatus.Failed,
  ];

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public static from(value: string): AnalysisRunStatus {
    const status = AnalysisRunStatus.#all.find(
      candidate => candidate.value === value,
    );
    if (!status) {
      throw new InvalidAnalysisRunException(
        'Analysis Run status must be running, completed or failed',
      );
    }

    return status;
  }

  public get value(): string {
    return this.#value;
  }

  public equals(other: AnalysisRunStatus): boolean {
    return other.value === this.#value;
  }
}
