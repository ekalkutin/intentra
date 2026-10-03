import { describe, expect, it } from 'vitest';

import { InvalidKnowledgeFieldsException } from '../exceptions/index.js';

import { DecisionContent } from './decision-content.vo.js';
import {
  createKnowledgeContent,
  type KnowledgeFields,
} from './knowledge-content.js';
import { KnowledgeKind } from './knowledge-kind.vo.js';
import { RequirementContent } from './requirement-content.vo.js';
import { TermContent } from './term-content.vo.js';

describe('TermContent', () => {
  it('needs only its definition, which is its main field', () => {
    // Act
    const content = new TermContent({
      definition: '  An offer to join a Workspace.  ',
      sort: null,
      synonymsToAvoid: [],
    });

    // Assert
    expect(content.kind).toBe(KnowledgeKind.Term);
    expect(content.mainField.value).toBe('An offer to join a Workspace.');
    expect(content.sort).toBeNull();
  });

  it.each([
    { definition: ' ', sort: null, synonymsToAvoid: [] },
    { definition: 'x'.repeat(5001), sort: null, synonymsToAvoid: [] },
    { definition: 'An offer', sort: 'thing', synonymsToAvoid: [] },
    { definition: 'An offer', sort: null, synonymsToAvoid: [''] },
  ])('rejects %j', props => {
    // Act
    const creating = () => new TermContent(props);

    // Assert
    expect(creating).toThrow(InvalidKnowledgeFieldsException);
  });
});

describe('RequirementContent', () => {
  it('keeps its choices and acceptance criteria', () => {
    // Act
    const content = new RequirementContent({
      statement: 'Export a report to PDF',
      type: 'functional',
      priority: 'must',
      acceptanceCriteria: ['The file opens in a PDF viewer'],
    });

    // Assert
    expect(content.mainField.value).toBe('Export a report to PDF');
    expect(content.type?.value).toBe('functional');
    expect(content.priority?.value).toBe('must');
    expect(content.acceptanceCriteria.map(({ value }) => value)).toEqual([
      'The file opens in a PDF viewer',
    ]);
  });

  it('rejects a priority outside Must, Should and Could', () => {
    // Act
    const creating = () =>
      new RequirementContent({
        statement: 'Export a report to PDF',
        type: null,
        priority: 'wont',
        acceptanceCriteria: [],
      });

    // Assert
    expect(creating).toThrow(InvalidKnowledgeFieldsException);
  });
});

describe('DecisionContent', () => {
  it('treats a blank context or reason as not given', () => {
    // Act
    const content = new DecisionContent({
      decision: 'Store data in MongoDB',
      area: 'architecture',
      context: ' ',
      rejectedAlternatives: [{ alternative: 'PostgreSQL', reason: '' }],
    });

    // Assert
    expect(content.mainField.value).toBe('Store data in MongoDB');
    expect(content.context).toBeNull();
    expect(content.rejectedAlternatives[0]?.reason).toBeNull();
  });

  it('rejects an alternative without its text', () => {
    // Act
    const creating = () =>
      new DecisionContent({
        decision: 'Store data in MongoDB',
        area: null,
        context: null,
        rejectedAlternatives: [{ alternative: ' ', reason: 'Too heavy' }],
      });

    // Assert
    expect(creating).toThrow(InvalidKnowledgeFieldsException);
  });
});

describe('createKnowledgeContent', () => {
  const fieldsOfKind: readonly (readonly [
    KnowledgeKind,
    KnowledgeFields,
    string,
  ])[] = [
    [
      KnowledgeKind.ProductOverview,
      {
        summary: 'A tool for invoices',
        problem: 'Lost bills',
        audience: null,
        value: null,
      },
      'A tool for invoices',
    ],
    [
      KnowledgeKind.Goal,
      { outcome: 'Halve late payments', successMetric: null },
      'Halve late payments',
    ],
    [
      KnowledgeKind.Persona,
      { profile: 'A bookkeeper', type: 'person', needs: ['Fast search'] },
      'A bookkeeper',
    ],
    [
      KnowledgeKind.Feature,
      { capability: 'Pay an invoice online', outOfScope: ['Refunds'] },
      'Pay an invoice online',
    ],
    [
      KnowledgeKind.Scenario,
      { expectedResult: 'The invoice is paid', steps: ['Open it', 'Pay'] },
      'The invoice is paid',
    ],
    [
      KnowledgeKind.Requirement,
      {
        statement: 'Export to PDF',
        type: null,
        priority: null,
        acceptanceCriteria: [],
      },
      'Export to PDF',
    ],
    [
      KnowledgeKind.Constraint,
      { constraint: 'Data stays in the EU', imposedBy: 'law' },
      'Data stays in the EU',
    ],
    [
      KnowledgeKind.Term,
      {
        definition: 'A bill sent to a customer',
        sort: 'entity',
        synonymsToAvoid: [],
      },
      'A bill sent to a customer',
    ],
    [
      KnowledgeKind.BusinessRule,
      { rule: 'An invoice is due in 30 days' },
      'An invoice is due in 30 days',
    ],
    [
      KnowledgeKind.Integration,
      {
        purpose: 'Take card payments',
        externalSystem: 'Stripe',
        direction: 'both',
        exchanged: null,
      },
      'Take card payments',
    ],
    [
      KnowledgeKind.Decision,
      {
        decision: 'Use MongoDB',
        area: null,
        context: null,
        rejectedAlternatives: [],
      },
      'Use MongoDB',
    ],
    [
      KnowledgeKind.OpenQuestion,
      { question: 'Do we support refunds?' },
      'Do we support refunds?',
    ],
  ];

  it('covers every Kind', () => {
    // Act
    const covered = fieldsOfKind.map(([kind]) => kind);

    // Assert
    expect(covered).toEqual(KnowledgeKind.all);
  });

  it.each(fieldsOfKind)(
    'builds the content of %o from its fields and gives them back',
    (kind, fields, mainField) => {
      // Act
      const content = createKnowledgeContent(kind, fields);

      // Assert
      expect(content.kind).toBe(kind);
      expect(content.mainField.value).toBe(mainField);
      expect(content.toFields()).toEqual(fields);
    },
  );

  it.each([
    [
      KnowledgeKind.Persona,
      { profile: 'A bookkeeper', type: 'robot', needs: [] },
    ],
    [KnowledgeKind.Constraint, { constraint: 'EU only', imposedBy: 'mood' }],
    [
      KnowledgeKind.Integration,
      {
        purpose: 'Payments',
        externalSystem: null,
        direction: 'sideways',
        exchanged: null,
      },
    ],
    [KnowledgeKind.OpenQuestion, { question: ' ' }],
    [KnowledgeKind.Feature, { capability: 'Pay online', outOfScope: [''] }],
  ])('rejects fields that do not fit %o', (kind, fields) => {
    // Act
    const creating = () => createKnowledgeContent(kind, fields);

    // Assert
    expect(creating).toThrow(InvalidKnowledgeFieldsException);
  });
});
