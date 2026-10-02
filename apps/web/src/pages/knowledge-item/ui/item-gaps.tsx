import { ArrowDown, CircleDashed } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { KindIcon } from '@/entities/knowledge-item';
import type { InterviewOpening } from '@/shared/config';
import { Notice } from '@/shared/ui';
import {
  KnowledgeKindDtoSchema,
  KnowledgeStatusDtoSchema,
  type KnowledgeGapRuleDto,
  type KnowledgeItemDto,
} from '@intentra/contracts/workspace';

import { DiscussWithIntentra } from './discuss-with-intentra';
import { revealRelated } from './reveal-related';

const { draft, approved } = KnowledgeStatusDtoSchema.enum;

/** An Open Question still in force and not answered: worth a Conversation of its own. */
function isUnansweredQuestion(item: KnowledgeItemDto): boolean {
  return (
    item.kind === KnowledgeKindDtoSchema.enum['open-question'] &&
    (item.status === draft || item.status === approved) &&
    item.answeredBy.length === 0
  );
}

/**
 * What is open about the item, an unanswered question or what it misses (the
 * Project's Gaps), with a new Conversation with Intentra that opens on it;
 * nothing when nothing is open. A question with an answer proposed already
 * leads to that answer instead: approving it is what closes the question.
 */
export function ItemGaps({
  item,
  rules,
  proposed,
  interviewPath,
}: {
  readonly item: KnowledgeItemDto;
  readonly rules: readonly KnowledgeGapRuleDto[];
  /** The Drafts that answer the item, when it is an Open Question. */
  readonly proposed: readonly KnowledgeItemDto[];
  readonly interviewPath: string;
}) {
  const { t } = useTranslation();

  const question = isUnansweredQuestion(item);
  if (question && proposed.length > 0) {
    return (
      <ProposedAnswers
        question={item}
        answers={proposed}
        interviewPath={interviewPath}
      />
    );
  }
  if (rules.length === 0 && !question) {
    return null;
  }

  const hints = rules.map(rule => t(`knowledge.gapHints.${rule}`));
  const opening: InterviewOpening = {
    opening: question
      ? t('knowledgeItem.discussQuestionPrompt', {
          key: item.key,
          title: item.title,
          question: item.mainField,
        })
      : t('knowledgeItem.discussGapsPrompt', {
          key: item.key,
          title: item.title,
          gaps: hints.join(' '),
        }),
  };
  const title = question
    ? t('knowledgeItem.questionOpenTitle')
    : t('knowledgeItem.gapsTitle');
  // Each open thing on its own line, led by its own mark: the question by the Open Question's, a gap by a dashed circle.
  const lines = [
    ...(question
      ? [
          {
            key: 'question',
            text: t('knowledgeItem.questionOpen'),
            isQuestion: true,
          },
        ]
      : []),
    ...rules.map((rule, index) => ({
      key: rule,
      text: hints[index] ?? '',
      isQuestion: false,
    })),
  ];

  return (
    // The action keeps a column of its own from 640px, level with the title, so no line runs under it.
    <Notice
      role='region'
      aria-label={title}
      title={
        <h2 className='flex items-center gap-2'>
          {title}
          {!question && rules.length > 1 && (
            <span className='font-mono text-xs font-normal text-muted-foreground tabular-nums'>
              {rules.length}
            </span>
          )}
        </h2>
      }
      action={<DiscussWithIntentra to={interviewPath} opening={opening} />}
    >
      {/* Each open thing on its own line, led by its own mark. */}
      <ul className='flex flex-col gap-1.5'>
        {lines.map(line => (
          <li key={line.key} className='flex items-start gap-2.5'>
            {line.isQuestion ? (
              <KindIcon
                kind={KnowledgeKindDtoSchema.enum['open-question']}
                className='mt-0.5 size-4 shrink-0'
              />
            ) : (
              <CircleDashed
                aria-hidden
                className='mt-0.5 size-4 shrink-0 text-muted-foreground/70'
              />
            )}
            <span className='min-w-0'>{line.text}</span>
          </li>
        ))}
      </ul>
    </Notice>
  );
}

/**
 * The answers proposed to the question. Each line brings its tile below into
 * view, where it is read and opened to be approved or rejected; the action
 * discusses them with Intentra.
 */
function ProposedAnswers({
  question,
  answers,
  interviewPath,
}: {
  readonly question: KnowledgeItemDto;
  readonly answers: readonly KnowledgeItemDto[];
  readonly interviewPath: string;
}) {
  const { t } = useTranslation();
  const count = answers.length;
  const title = t('knowledgeItem.answerProposedTitle', { count });
  const opening: InterviewOpening = {
    opening: t('knowledgeItem.discussAnswerPrompt', {
      key: question.key,
      title: question.title,
      question: question.mainField,
      answers: answers
        .map(answer => `${answer.key} «${answer.title}» — ${answer.mainField}`)
        .join('; '),
    }),
  };

  return (
    <Notice
      role='region'
      aria-label={title}
      title={
        <h2 className='flex items-center gap-2'>
          {title}
          {count > 1 && (
            <span className='font-mono text-xs font-normal text-muted-foreground tabular-nums'>
              {count}
            </span>
          )}
        </h2>
      }
      action={<DiscussWithIntentra to={interviewPath} opening={opening} />}
    >
      <ul className='flex flex-col gap-1.5'>
        {answers.map(answer => (
          <li key={answer.key}>
            <button
              type='button'
              aria-label={`${answer.key} ${answer.title}. ${t('knowledgeItem.showAnswer')}`}
              onClick={() => revealRelated(answer.key)}
              className='group/answer -mx-1.5 flex max-w-full items-start gap-2.5 rounded-md px-1.5 py-0.5 text-left transition-colors duration-150 outline-none hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring/50'
            >
              <KindIcon kind={answer.kind} className='mt-0.5 size-4 shrink-0' />
              <span className='min-w-0'>
                <span className='mr-2 font-mono text-xs'>{answer.key}</span>
                <span className='text-foreground'>{answer.title}</span>
              </span>
              <ArrowDown
                aria-hidden
                className='mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-hover/answer:translate-y-0.5 motion-reduce:transition-none'
              />
            </button>
          </li>
        ))}
        <li>{t('knowledgeItem.answerProposedHint', { count })}</li>
      </ul>
    </Notice>
  );
}
