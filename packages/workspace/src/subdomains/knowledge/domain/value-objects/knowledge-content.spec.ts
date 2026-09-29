import { describe, expect, it } from 'vitest';

import { InvalidKnowledgeFieldsException } from '../exceptions/index.js';

import { DecisionContent } from './decision-content.vo.js';
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
