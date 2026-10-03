import { BookOpen, MessageSquare, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  KindBadge,
  KnowledgeStatusBadge,
  NeedsReviewBadge,
} from '@/entities/knowledge-item';
import { Button, IntentraButton } from '@/shared/ui';

/** An illustrative relationship model, using the same records as the interview. */
export function KnowledgeScene({ paused }: { readonly paused: boolean }) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clear = () => {
    timer.current.forEach(clearTimeout);
    timer.current = [];
  };
  useEffect(() => clear, []);

  const replace = () => {
    clear();
    const still =
      paused || matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPhase(still ? 3 : 1);
    if (!still) {
      timer.current = [
        setTimeout(() => setPhase(2), 500),
        setTimeout(() => setPhase(3), 1000),
      ];
    }
  };
  const changed = phase > 0;

  return (
    <section
      id='benefits'
      className='landing-knowledge-scene'
      aria-labelledby='knowledge-scene-title'
    >
      <div className='landing-wrap'>
        <div className='landing-knowledge-heading'>
          <h2 id='knowledge-scene-title'>{t('landing.knowledge.title')}</h2>
          <p>{t('landing.knowledge.text')}</p>
        </div>
        <div className='landing-knowledge-map' data-phase={phase}>
          <svg
            className='landing-knowledge-wires'
            viewBox='0 0 1000 420'
            preserveAspectRatio='none'
            aria-hidden
          >
            <path d='M167 210 H333' />
            <path d='M667 210 H700 V110 H730' />
            <path d='M667 210 H700 V310 H730' />
            {changed && (
              <>
                <path
                  className='landing-knowledge-signal signal-first'
                  d='M667 210 H700 V110 H730'
                  pathLength='1'
                />
                <path
                  className='landing-knowledge-signal signal-second'
                  d='M667 210 H700 V310 H730'
                  pathLength='1'
                />
              </>
            )}
          </svg>
          <div className='landing-model-index'>
            <div className='landing-model-project'>
              <BookOpen size={16} aria-hidden />
              <span>{t('landing.knowledge.passport')}</span>
            </div>
            <div
              className='landing-model-chapters'
              aria-label={t('landing.knowledge.chapters')}
            >
              <span>{t('landing.knowledge.overview')}</span>
              <span>{t('landing.knowledge.people')}</span>
              <strong>{t('landing.knowledge.rules')}</strong>
              <span>{t('landing.knowledge.decisions')}</span>
            </div>
            <div className='landing-model-question'>
              <KindBadge kind='open-question' />
              <p>{t('landing.knowledge.question')}</p>
              <code>OQ-05</code>
            </div>
          </div>
          <article
            className='landing-rule-sheet'
            aria-label={t('landing.knowledge.rule')}
          >
            <div className='landing-rule-meta'>
              <code>{changed ? 'BR-13' : 'BR-12'}</code>
              <KnowledgeStatusBadge status='approved' />
            </div>
            <KindBadge kind='business-rule' />
            <h3>{t('landing.knowledge.rule')}</h3>
            <div className='landing-rule-value' key={changed ? '48' : '24'}>
              <span>{changed ? '48' : '24'}</span>
              <span>
                {t(
                  changed
                    ? 'landing.knowledge.hoursMany'
                    : 'landing.knowledge.hoursFew',
                )}
              </span>
            </div>
            <p className='landing-rule-meaning'>
              {t('landing.knowledge.meaning')}
            </p>
            <div className='landing-rule-source'>
              <MessageSquare size={13} aria-hidden />
              <span>
                {t(
                  changed
                    ? 'landing.knowledge.sourceAfter'
                    : 'landing.knowledge.sourceBefore',
                )}
              </span>
            </div>
            <p className='landing-rule-version'>
              {t(
                changed
                  ? 'landing.knowledge.historyAfter'
                  : 'landing.knowledge.historyBefore',
              )}
            </p>
          </article>
          <div className='landing-model-dependents'>
            <article className='landing-linked-record' data-review={phase >= 2}>
              <div className='landing-linked-meta'>
                <code>SC-08</code>
                <KindBadge kind='scenario' />
              </div>
              <h3>{t('landing.knowledge.scenario')}</h3>
              <p>{t('landing.knowledge.scenarioText')}</p>
              <div className='landing-linked-status'>
                {phase >= 2 ? (
                  <NeedsReviewBadge />
                ) : (
                  <KnowledgeStatusBadge status='approved' />
                )}
              </div>
            </article>
            <article className='landing-linked-record' data-review={phase >= 3}>
              <div className='landing-linked-meta'>
                <code>REQ-24</code>
                <KindBadge kind='requirement' />
              </div>
              <h3>{t('landing.knowledge.requirement')}</h3>
              <p>{t('landing.knowledge.requirementText')}</p>
              <div className='landing-linked-status'>
                {phase >= 3 ? (
                  <NeedsReviewBadge />
                ) : (
                  <KnowledgeStatusBadge status='approved' />
                )}
              </div>
            </article>
          </div>
        </div>
        <div className='landing-knowledge-caption'>
          <div className='landing-knowledge-controls'>
            <IntentraButton size='default' onClick={replace} disabled={changed}>
              {t(
                changed
                  ? 'landing.knowledge.changed'
                  : 'landing.knowledge.change',
              )}
            </IntentraButton>
            {changed && (
              <Button
                variant='ghost'
                size='icon'
                aria-label={t('landing.knowledge.reset')}
                onClick={() => {
                  clear();
                  setPhase(0);
                }}
              >
                <RotateCcw />
              </Button>
            )}
          </div>
          <p role='status'>
            {t(
              phase === 3
                ? 'landing.knowledge.result'
                : 'landing.knowledge.hint',
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
