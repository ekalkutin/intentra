import { ArrowUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AgentSpark } from '@/shared/ui';

/** Milliseconds per typed character of the opening message. */
const TYPE_MS = 26;

/**
 * The way into the interview: Intentra asks what is being built, the opening
 * message types itself into a composer, and one click sends it and opens the
 * conversation.
 */
export function DemoInvite({
  message,
  onStart,
}: {
  readonly message: string;
  readonly onStart: () => void;
}) {
  const { t } = useTranslation();
  const [typed, setTyped] = useState(0);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTyped(message.length);
      return;
    }
    setTyped(0);
    let timer: ReturnType<typeof setInterval> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || timer) return;
        timer = setInterval(
          () =>
            setTyped(value => {
              if (value >= message.length) clearInterval(timer);
              return Math.min(value + 1, message.length);
            }),
          TYPE_MS,
        );
      },
      { threshold: 0.5 },
    );
    if (root.current) observer.observe(root.current);
    return () => {
      clearInterval(timer);
      observer.disconnect();
    };
  }, [message]);

  return (
    <div ref={root} className='landing-invite'>
      <p className='landing-speaker'>
        <AgentSpark active />
        {t('landing.demoSection.analyst')}
      </p>
      <p className='landing-invite-title'>
        {t('landing.demoSection.invite.title')}
      </p>
      <button
        type='button'
        className='landing-invite-composer'
        aria-label={t('landing.demoSection.invite.action')}
        onClick={onStart}
      >
        <span className='landing-invite-text'>
          <span className='landing-terminal-type-measure' aria-hidden>
            {message}
          </span>
          <span className='landing-terminal-type-ink' aria-hidden>
            {message.slice(0, typed)}
            <i className='landing-terminal-caret' />
          </span>
        </span>
        <span className='landing-invite-send'>
          {t('landing.demoSection.invite.action')}
          <ArrowUp size={16} aria-hidden />
        </span>
      </button>
      <p className='landing-invite-note'>
        {t('landing.demoSection.invite.note')}
      </p>
    </div>
  );
}
