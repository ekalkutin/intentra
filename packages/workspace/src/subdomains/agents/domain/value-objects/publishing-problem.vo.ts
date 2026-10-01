/** What kind of thing keeps the Unpublished Agents from being published. */
export class PublishingProblemKind {
  public static readonly OrchestratorCount = new PublishingProblemKind(
    'orchestrator-count',
  );
  public static readonly DuplicateSkillName = new PublishingProblemKind(
    'duplicate-skill-name',
  );
  public static readonly ToolUnavailable = new PublishingProblemKind(
    'tool-unavailable',
  );
  public static readonly SkillMissing = new PublishingProblemKind(
    'skill-missing',
  );
  public static readonly ModelProfileMissing = new PublishingProblemKind(
    'model-profile-missing',
  );
  public static readonly SpecialistCallsAgents = new PublishingProblemKind(
    'specialist-calls-agents',
  );
  public static readonly CallsNonSpecialist = new PublishingProblemKind(
    'calls-non-specialist',
  );

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public get value(): string {
    return this.#value;
  }

  public equals(other: PublishingProblemKind): boolean {
    return other.value === this.#value;
  }
}

/** The Agent or Skill a problem is about. */
export type PublishingProblemSubject = {
  /** Null when the problem names several objects, such as two Skills with one name. */
  readonly id: string | null;
  readonly name: string;
};

/** One thing that keeps the Unpublished Agents from being published. */
export class PublishingProblem {
  readonly #kind: PublishingProblemKind;
  readonly #subject: PublishingProblemSubject | null;
  readonly #tool: string | null;

  private constructor(
    kind: PublishingProblemKind,
    subject: PublishingProblemSubject | null,
    tool: string | null = null,
  ) {
    this.#kind = kind;
    this.#subject = subject;
    this.#tool = tool;
  }

  public static orchestratorCount(): PublishingProblem {
    return new PublishingProblem(PublishingProblemKind.OrchestratorCount, null);
  }

  public static duplicateSkillName(name: string): PublishingProblem {
    return new PublishingProblem(PublishingProblemKind.DuplicateSkillName, {
      id: null,
      name,
    });
  }

  public static toolUnavailable(
    agent: PublishingProblemSubject,
    tool: string,
  ): PublishingProblem {
    return new PublishingProblem(
      PublishingProblemKind.ToolUnavailable,
      agent,
      tool,
    );
  }

  public static skillMissing(
    agent: PublishingProblemSubject,
  ): PublishingProblem {
    return new PublishingProblem(PublishingProblemKind.SkillMissing, agent);
  }

  public static modelProfileMissing(
    agent: PublishingProblemSubject,
  ): PublishingProblem {
    return new PublishingProblem(
      PublishingProblemKind.ModelProfileMissing,
      agent,
    );
  }

  public static specialistCallsAgents(
    agent: PublishingProblemSubject,
  ): PublishingProblem {
    return new PublishingProblem(
      PublishingProblemKind.SpecialistCallsAgents,
      agent,
    );
  }

  public static callsNonSpecialist(
    agent: PublishingProblemSubject,
  ): PublishingProblem {
    return new PublishingProblem(
      PublishingProblemKind.CallsNonSpecialist,
      agent,
    );
  }

  public get kind(): PublishingProblemKind {
    return this.#kind;
  }

  public get subject(): PublishingProblemSubject | null {
    return this.#subject;
  }

  /** The tool, for a tool the code no longer has. */
  public get tool(): string | null {
    return this.#tool;
  }

  /** The problem in words, for logs and error messages. */
  public describe(): string {
    const name = this.#subject?.name ?? '';
    switch (this.#kind) {
      case PublishingProblemKind.OrchestratorCount:
        return 'there must be exactly one Orchestrator';
      case PublishingProblemKind.DuplicateSkillName:
        return `more than one Skill is called "${name}"`;
      case PublishingProblemKind.ToolUnavailable:
        return `${name} uses the tool ${this.#tool ?? ''}, which the code no longer has`;
      case PublishingProblemKind.SkillMissing:
        return `${name} uses a Skill that does not exist`;
      case PublishingProblemKind.ModelProfileMissing:
        return `${name} is on a Model Profile that does not exist`;
      case PublishingProblemKind.SpecialistCallsAgents:
        return `${name} is a Specialist and cannot call other Agents`;
      default:
        return `${name} may call an Agent that is not a Specialist`;
    }
  }
}
