/** What a Gap misses. Gaps are listed in the order of their rules. */
export class KnowledgeGapRule {
  /** The Project has no Product Overview. */
  public static readonly NoProductOverview = new KnowledgeGapRule(
    'no-product-overview',
    true,
  );
  /** The Project has no Persona. */
  public static readonly NoPersona = new KnowledgeGapRule('no-persona', true);
  /** The Project has no Goal. */
  public static readonly NoGoal = new KnowledgeGapRule('no-goal', true);
  /** A Must Requirement says nothing of how to check it. */
  public static readonly RequirementWithoutAcceptanceCriteria =
    new KnowledgeGapRule('requirement-without-acceptance-criteria', false);
  /** A Goal says nothing of how its success is measured. */
  public static readonly GoalWithoutSuccessMetric = new KnowledgeGapRule(
    'goal-without-success-metric',
    false,
  );
  /** A Decision names nothing it was chosen over. */
  public static readonly DecisionWithoutRejectedAlternatives =
    new KnowledgeGapRule('decision-without-rejected-alternatives', false);
  /** A Scenario names no Persona who performs it. */
  public static readonly ScenarioWithoutPersona = new KnowledgeGapRule(
    'scenario-without-persona',
    false,
  );
  /** A Persona who is a person performs no Scenario. */
  public static readonly PersonaWithoutScenario = new KnowledgeGapRule(
    'persona-without-scenario',
    false,
  );
  /** No Requirement says what the system does in a Scenario. */
  public static readonly ScenarioWithoutRequirement = new KnowledgeGapRule(
    'scenario-without-requirement',
    false,
  );
  /** A Feature serves no Goal: no `depends on` to one. */
  public static readonly FeatureWithoutGoal = new KnowledgeGapRule(
    'feature-without-goal',
    false,
  );
  /** Nothing is part of a Feature. */
  public static readonly FeatureWithoutParts = new KnowledgeGapRule(
    'feature-without-parts',
    false,
  );
  /** A Scenario is part of no Feature, once the Project has one. */
  public static readonly ScenarioWithoutFeature = new KnowledgeGapRule(
    'scenario-without-feature',
    false,
  );
  /** No Requirement or Business Rule rests on an Integration. */
  public static readonly IntegrationWithoutUse = new KnowledgeGapRule(
    'integration-without-use',
    false,
  );
  /** No Context Pack reaches an Approved item but as its own Anchor. */
  public static readonly Unlinked = new KnowledgeGapRule('unlinked', false);

  static readonly #all: readonly KnowledgeGapRule[] = [
    KnowledgeGapRule.NoProductOverview,
    KnowledgeGapRule.NoPersona,
    KnowledgeGapRule.NoGoal,
    KnowledgeGapRule.RequirementWithoutAcceptanceCriteria,
    KnowledgeGapRule.GoalWithoutSuccessMetric,
    KnowledgeGapRule.DecisionWithoutRejectedAlternatives,
    KnowledgeGapRule.ScenarioWithoutPersona,
    KnowledgeGapRule.PersonaWithoutScenario,
    KnowledgeGapRule.ScenarioWithoutRequirement,
    KnowledgeGapRule.FeatureWithoutGoal,
    KnowledgeGapRule.FeatureWithoutParts,
    KnowledgeGapRule.ScenarioWithoutFeature,
    KnowledgeGapRule.IntegrationWithoutUse,
    KnowledgeGapRule.Unlinked,
  ];

  readonly #value: string;
  readonly #ofProject: boolean;

  private constructor(value: string, ofProject: boolean) {
    this.#value = value;
    this.#ofProject = ofProject;
  }

  public static get all(): readonly KnowledgeGapRule[] {
    return KnowledgeGapRule.#all;
  }

  public get value(): string {
    return this.#value;
  }

  /** Whether its Gap is of the Project as a whole rather than of one item. */
  public get ofProject(): boolean {
    return this.#ofProject;
  }

  /** Lower comes first. */
  public get rank(): number {
    return KnowledgeGapRule.#all.indexOf(this);
  }
}
