import { ArrowRight, ArrowUp, Check, PenLine } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib';
import {
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  Kbd,
  Questionnaire,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireItem,
} from '@/shared/ui';
import type { ChoicesDto } from '@intentra/contracts/workspace';

const FIELD = 'answer';
/** How a multiple answer joins its parts into one reply. */
const JOIN = ', ';
/** A typed answer, like a message, has the server's limit. */
const ANSWER_MAX = 2000;
/** One answer option, frozen in the transcript; long ones wrap. */
const ANSWER_CHIP =
  'inline-flex max-w-full items-center gap-1.5 rounded-md px-2 py-1 text-sm leading-5';

/**
 * A question the agent asked with clear-cut answers. A single answer is a
 * list of replies: a click or its number key sends one at once. Several
 * answers are checkboxes sent with "Ответить". Either may take the Member's
 * own words. Once answered, it keeps showing what was said.
 */
export function ChoicesCard({
  choices,
  answer,
  disabled,
  onAnswer,
}: {
  readonly choices: ChoicesDto;
  /** The Member's reply that followed, once there is one. */
  readonly answer: string | null;
  readonly disabled: boolean;
  readonly onAnswer: (text: string) => void;
}) {
  const { t } = useTranslation();

  if (answer !== null) {
    return <AnsweredChoices choices={choices} answer={answer} />;
  }

  return (
    <div className='flex max-w-xl flex-col gap-3'>
      <div className='flex flex-col gap-0.5'>
        <p className='text-sm leading-6 font-medium text-pretty'>
          {choices.question}
        </p>
        <p className='text-xs text-muted-foreground'>
          {choices.multiple
            ? t('interview.choicesMultiple')
            : t('interview.choicesSingle')}
        </p>
      </div>
      {choices.multiple ? (
        <MultipleChoices
          choices={choices}
          disabled={disabled}
          onAnswer={onAnswer}
        />
      ) : (
        <SingleChoices
          choices={choices}
          disabled={disabled}
          onAnswer={onAnswer}
        />
      )}
    </div>
  );
}

/** One answer: each option is a reply sent on click or by its number. */
function SingleChoices({
  choices,
  disabled,
  onAnswer,
}: {
  readonly choices: ChoicesDto;
  readonly disabled: boolean;
  readonly onAnswer: (text: string) => void;
}) {
  // Number keys answer while the Member is not typing somewhere.
  useEffect(() => {
    if (disabled) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        target?.closest('input, textarea, [contenteditable="true"]')
      ) {
        return;
      }
      const option = choices.options[Number(event.key) - 1];
      if (option) {
        event.preventDefault();
        onAnswer(option.label);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [choices, disabled, onAnswer]);

  return (
    <>
      <ul className='flex flex-col gap-2'>
        {choices.options.map((option, index) => (
          <li key={option.label}>
            <Button
              variant='outline'
              disabled={disabled}
              onClick={() => onAnswer(option.label)}
              aria-keyshortcuts={String(index + 1)}
              className='group/choice h-auto w-full items-start justify-start gap-3 rounded-lg px-3 py-2.5 text-left font-normal whitespace-normal'
            >
              <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
                <span className='text-sm leading-5'>{option.label}</span>
                {option.description && (
                  <span className='text-sm leading-5 text-muted-foreground'>
                    {option.description}
                  </span>
                )}
              </span>
              <Kbd className='mt-px group-hover/choice:hidden group-focus-visible/choice:hidden'>
                {index + 1}
              </Kbd>
              <ArrowRight
                aria-hidden
                className='mt-0.5 hidden size-4 text-muted-foreground group-hover/choice:block group-focus-visible/choice:block'
              />
            </Button>
          </li>
        ))}
      </ul>
      {choices.allowCustom && (
        <OwnAnswer disabled={disabled} onAnswer={onAnswer} />
      )}
    </>
  );
}

/** Several answers: checkboxes, perhaps the Member's own words, then "Ответить". */
function MultipleChoices({
  choices,
  disabled,
  onAnswer,
}: {
  readonly choices: ChoicesDto;
  readonly disabled: boolean;
  readonly onAnswer: (text: string) => void;
}) {
  const { t } = useTranslation();
  const [picked, setPicked] = useState<string[]>([]);
  const [own, setOwn] = useState('');
  const reply = [...picked, ...(own.trim() ? [own.trim()] : [])];

  return (
    <Questionnaire
      className='gap-3'
      onSubmit={event => {
        event.preventDefault();
        if (!disabled && reply.length > 0) {
          onAnswer(reply.join(JOIN));
        }
      }}
    >
      {/* Not `disabled` on the item: a disabled item hides itself and may not come back. */}
      <QuestionnaireItem name={FIELD} multiple>
        <QuestionnaireChoices
          className={cn(choices.options.length > 3 && 'sm:grid-cols-2')}
        >
          {choices.options.map(option => (
            <QuestionnaireChoice
              key={option.label}
              value={option.label}
              disabled={disabled}
              checked={picked.includes(option.label)}
              onChange={event =>
                setPicked(current =>
                  event.target.checked
                    ? [...current, option.label]
                    : current.filter(label => label !== option.label),
                )
              }
            >
              {option.label}
              {option.description && (
                <QuestionnaireChoiceDescription>
                  {option.description}
                </QuestionnaireChoiceDescription>
              )}
            </QuestionnaireChoice>
          ))}
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <div className='flex flex-col gap-2 sm:flex-row'>
        {choices.allowCustom && (
          <InputGroup className='sm:flex-1'>
            <InputGroupInput
              value={own}
              maxLength={ANSWER_MAX}
              disabled={disabled}
              onChange={event => setOwn(event.target.value)}
              placeholder={t('interview.choicesOther')}
              aria-label={t('interview.choicesOther')}
            />
          </InputGroup>
        )}
        <Button type='submit' disabled={disabled || reply.length === 0}>
          {reply.length > 0
            ? t('interview.choicesSubmitCount', { count: reply.length })
            : t('interview.choicesSubmit')}
        </Button>
      </div>
    </Questionnaire>
  );
}

/** The Member's own words for a single answer, sent with Enter or the arrow. */
function OwnAnswer({
  disabled,
  onAnswer,
}: {
  readonly disabled: boolean;
  readonly onAnswer: (text: string) => void;
}) {
  const { t } = useTranslation();
  const [own, setOwn] = useState('');
  const send = () => {
    if (own.trim() && !disabled) {
      onAnswer(own.trim());
    }
  };

  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        send();
      }}
    >
      <InputGroup>
        <InputGroupInput
          value={own}
          maxLength={ANSWER_MAX}
          disabled={disabled}
          onChange={event => setOwn(event.target.value)}
          placeholder={t('interview.choicesOther')}
          aria-label={t('interview.choicesOther')}
        />
        <InputGroupAddon align='inline-end'>
          <InputGroupButton
            type='submit'
            size='icon-xs'
            // Not `disabled`: the group would grey out the whole field with it.
            aria-disabled={disabled || own.trim() === ''}
            className={cn(own.trim() === '' && 'opacity-50')}
            aria-label={t('interview.send')}
          >
            <ArrowUp />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}

/** What was asked and what the Member answered, kept in the transcript. */
function AnsweredChoices({
  choices,
  answer,
}: {
  readonly choices: ChoicesDto;
  readonly answer: string;
}) {
  const { t } = useTranslation();
  const picked = new Set(answer.split(JOIN));
  const labels = new Set(choices.options.map(option => option.label));
  // What the Member wrote in their own words, beside or instead of the options.
  const own = choices.options.some(option => picked.has(option.label))
    ? [...picked].filter(part => !labels.has(part)).join(JOIN)
    : answer;

  return (
    <div className='flex max-w-xl flex-col gap-2'>
      <p className='text-sm leading-6 font-medium text-pretty'>
        {choices.question}
      </p>
      <ul className='flex flex-wrap gap-1.5'>
        {choices.options.map(option => {
          const chosen = picked.has(option.label);
          return (
            <li
              key={option.label}
              className={cn(
                ANSWER_CHIP,
                chosen
                  ? 'bg-secondary text-secondary-foreground'
                  : 'border border-border text-muted-foreground',
              )}
            >
              {chosen && <Check aria-hidden className='size-3.5 shrink-0' />}
              {option.label}
              {chosen && (
                <span className='sr-only'>
                  {' '}
                  ({t('interview.choicesPicked')})
                </span>
              )}
            </li>
          );
        })}
        {own.trim() !== '' && (
          <li
            className={cn(
              ANSWER_CHIP,
              'bg-secondary text-secondary-foreground',
            )}
          >
            <PenLine aria-hidden className='size-3.5 shrink-0' />
            <span className='sr-only'>{t('interview.choicesOwnAnswer')}: </span>
            {own}
          </li>
        )}
      </ul>
    </div>
  );
}
