import { InvalidAnalysisRunException } from '../exceptions/index.js';

/** Why an Analysis Run failed. */
export class AnalysisRunFailure {
  /** The API stopped while it ran. */
  public static readonly Interrupted = new AnalysisRunFailure('interrupted');
  /** The Workspace has no Provider Key to run it on. */
  public static readonly ProviderKeyMissing = new AnalysisRunFailure(
    'provider-key-missing',
  );
  /** No Agents are published yet, so there is no Auditor. */
  public static readonly AgentsNotPublished = new AnalysisRunFailure(
    'agents-not-published',
  );
  /** The Auditor or its model failed; the cause is in the logs. */
  public static readonly AuditorFailed = new AnalysisRunFailure(
    'auditor-failed',
  );

  static readonly #all: readonly AnalysisRunFailure[] = [
    AnalysisRunFailure.Interrupted,
    AnalysisRunFailure.ProviderKeyMissing,
    AnalysisRunFailure.AgentsNotPublished,
    AnalysisRunFailure.AuditorFailed,
  ];

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public static from(value: string): AnalysisRunFailure {
    const failure = AnalysisRunFailure.#all.find(
      candidate => candidate.value === value,
    );
    if (!failure) {
      throw new InvalidAnalysisRunException(
        'Analysis Run failure must be interrupted, provider-key-missing, agents-not-published or auditor-failed',
      );
    }

    return failure;
  }

  public get value(): string {
    return this.#value;
  }
}
