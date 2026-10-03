import { KnowledgeItem } from '../entities/index.js';
import {
  DecisionContent,
  GoalContent,
  KnowledgeGap,
  KnowledgeGapRule,
  KnowledgeKind,
  PersonaContent,
  PersonaType,
  RequirementContent,
  RequirementPriority,
} from '../value-objects/index.js';

export class KnowledgeGapService {
  /**
   * Every Gap of a Project, by rule, then by Kind and Knowledge Key. `current`
   * holds every Draft and Approved item of the Project: a Draft closes a Gap
   * as an Approved item does, since someone has thought of it, while
   * Unlinked counts only Links between Approved items, the ones a Context
   * Pack walks.
   */
  public findGaps(current: readonly KnowledgeItem[]): KnowledgeGap[] {
    const items = [...current].sort(
      (a, b) =>
        KnowledgeKind.all.indexOf(a.kind) - KnowledgeKind.all.indexOf(b.kind) ||
        a.key.number - b.key.number,
    );
    const ofKind = (kind: KnowledgeKind) =>
      items.filter(item => item.kind.equals(kind));
    const dependents = (target: KnowledgeItem, kinds: KnowledgeKind[]) =>
      items.filter(
        item =>
          kinds.some(kind => item.kind.equals(kind)) &&
          item.dependencies().some(key => key.equals(target.key)),
      );
    const gaps: KnowledgeGap[] = [];
    const add = (rule: KnowledgeGapRule, found: readonly KnowledgeItem[]) =>
      gaps.push(...found.map(item => new KnowledgeGap(rule, item.key)));

    for (const [rule, kind] of [
      [KnowledgeGapRule.NoProductOverview, KnowledgeKind.ProductOverview],
      [KnowledgeGapRule.NoPersona, KnowledgeKind.Persona],
      [KnowledgeGapRule.NoGoal, KnowledgeKind.Goal],
    ] as const) {
      if (ofKind(kind).length === 0) {
        gaps.push(new KnowledgeGap(rule, null));
      }
    }

    add(
      KnowledgeGapRule.RequirementWithoutAcceptanceCriteria,
      items.filter(
        ({ content }) =>
          content instanceof RequirementContent &&
          content.priority === RequirementPriority.Must &&
          content.acceptanceCriteria.length === 0,
      ),
    );
    add(
      KnowledgeGapRule.GoalWithoutSuccessMetric,
      items.filter(
        ({ content }) =>
          content instanceof GoalContent && content.successMetric === null,
      ),
    );
    add(
      KnowledgeGapRule.DecisionWithoutRejectedAlternatives,
      items.filter(
        ({ content }) =>
          content instanceof DecisionContent &&
          content.rejectedAlternatives.length === 0,
      ),
    );
    const personas = ofKind(KnowledgeKind.Persona);
    add(
      KnowledgeGapRule.ScenarioWithoutPersona,
      ofKind(KnowledgeKind.Scenario).filter(
        scenario =>
          !scenario
            .dependencies()
            .some(key => personas.some(persona => persona.key.equals(key))),
      ),
    );

    add(
      KnowledgeGapRule.PersonaWithoutScenario,
      personas.filter(
        persona =>
          persona.content instanceof PersonaContent &&
          persona.content.type !== PersonaType.System &&
          dependents(persona, [KnowledgeKind.Scenario]).length === 0,
      ),
    );
    add(
      KnowledgeGapRule.ScenarioWithoutRequirement,
      ofKind(KnowledgeKind.Scenario).filter(
        scenario =>
          dependents(scenario, [KnowledgeKind.Requirement]).length === 0,
      ),
    );
    const goals = ofKind(KnowledgeKind.Goal);
    const features = ofKind(KnowledgeKind.Feature);
    add(
      KnowledgeGapRule.FeatureWithoutGoal,
      features.filter(
        feature =>
          !feature
            .dependencies()
            .some(key => goals.some(goal => goal.key.equals(key))),
      ),
    );
    add(
      KnowledgeGapRule.FeatureWithoutParts,
      features.filter(
        feature => !items.some(item => item.feature?.equals(feature.key)),
      ),
    );
    add(
      KnowledgeGapRule.ScenarioWithoutFeature,
      features.length === 0
        ? []
        : ofKind(KnowledgeKind.Scenario).filter(
            scenario => scenario.feature === null,
          ),
    );
    add(
      KnowledgeGapRule.IntegrationWithoutUse,
      ofKind(KnowledgeKind.Integration).filter(
        integration =>
          dependents(integration, [
            KnowledgeKind.Requirement,
            KnowledgeKind.BusinessRule,
          ]).length === 0,
      ),
    );

    add(KnowledgeGapRule.Unlinked, findUnlinked(items));

    return gaps;
  }
}

/**
 * The Approved items no Context Pack could reach but as its own Anchor: no
 * Link of their own, none from another Approved item, and not of the Project
 * Frame, which agents read whatever it links to. A Feature is left out: one
 * with no Goal or no parts has Gaps of its own that say what it misses.
 */
function findUnlinked(items: readonly KnowledgeItem[]): KnowledgeItem[] {
  const approved = items.filter(item => item.isApproved());
  const targets = new Set(
    approved.flatMap(item => item.links.map(link => link.target.value)),
  );

  return approved.filter(
    item =>
      !item.isOfProjectFrame() &&
      !item.kind.equals(KnowledgeKind.Feature) &&
      item.links.length === 0 &&
      !targets.has(item.key.value),
  );
}
