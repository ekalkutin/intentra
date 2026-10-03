import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useHasSession } from '@/entities/session';
import { ROUTES } from '@/shared/config';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui';

import {
  isTypedLine,
  MCP_SCENARIO_HOLD,
  MCP_SCENARIOS,
} from '../model/mcp-scenarios';

import { LandingAction } from './landing-action';
import { McpTerminal, type TerminalStep } from './mcp-terminal';

/** Local, rotating examples: no MCP calls or project mutations. */
export function McpShowcase({ paused }: { readonly paused: boolean }) {
  const { t } = useTranslation();
  const signedIn = useHasSession();
  const [playhead, setPlayhead] = useState({ index: 0, elapsed: 0 });
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const scripts = useMemo(
    () =>
      MCP_SCENARIOS.map(scenario => {
        const copy: Readonly<Record<string, string>> = t(
          `landing.agents.scenarios.${scenario.id}`,
          { returnObjects: true },
        );
        let cursor = 0;
        const steps: TerminalStep[] = scenario.lines.map(([kind, key]) => {
          const text =
            key === 'connected' ? t('landing.agents.connected') : copy[key]!;
          const duration = isTypedLine(kind)
            ? Math.min(1800, Math.max(650, text.length * 22))
            : kind === 'call'
              ? 620
              : 380;
          const step = {
            kind,
            key,
            text,
            start: cursor,
            end: cursor + duration,
          };
          cursor = step.end + (kind === 'answer' ? 0 : 160);
          return step;
        });
        return { ...scenario, steps, duration: cursor };
      }),
    [t],
  );
  const script = scripts[playhead.index]!;
  const time = reduced ? script.duration : playhead.elapsed;
  const complete = time >= script.duration;
  const ticking = visible && !paused && !reduced && !(complete && focused);

  useEffect(() => {
    let inView = false;
    const syncVisibility = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? false;
        syncVisibility();
      },
      { threshold: 0.2 },
    );
    if (root.current) observer.observe(root.current);
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => setReduced(media.matches);
    syncMotion();
    media.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      observer.disconnect();
      media.removeEventListener('change', syncMotion);
      document.removeEventListener('visibilitychange', syncVisibility);
    };
  }, []);

  useEffect(() => {
    if (!ticking) return;
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      const delta = Math.min(now - last, 100);
      last = now;
      setPlayhead(value =>
        value.elapsed + delta >=
        scripts[value.index]!.duration + MCP_SCENARIO_HOLD
          ? { index: (value.index + 1) % scripts.length, elapsed: 0 }
          : { ...value, elapsed: value.elapsed + delta },
      );
    }, 40);
    return () => clearInterval(timer);
  }, [ticking, scripts]);

  return (
    <Tabs
      ref={root}
      value={script.id}
      orientation='vertical'
      className='landing-wrap landing-agents-grid landing-mcp-showcase'
      onValueChange={value => {
        const index = scripts.findIndex(item => item.id === value);
        if (index >= 0 && index !== playhead.index)
          setPlayhead({ index, elapsed: 0 });
      }}
      onFocusCapture={event =>
        setFocused(event.target.matches(':focus-visible'))
      }
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <div className='landing-agents-story'>
        <h2>{t('landing.agents.title')}</h2>
        <p>{t('landing.agents.text')}</p>
        <TabsList
          variant='line'
          className='landing-mcp-scenarios'
          aria-label={t('landing.agents.scenarioLabel')}
        >
          {scripts.map(item => (
            <TabsTrigger
              value={item.id}
              key={item.id}
              className='landing-mcp-scenario'
            >
              <span>{t(`landing.agents.scenarios.${item.id}.title`)}</span>
              <small>{t(`landing.agents.scenarios.${item.id}.prompt`)}</small>
              {/* How far the scenario on screen has played, hold included. */}
              <i
                aria-hidden
                style={{
                  scale: `${
                    item.id === script.id
                      ? Math.min(1, time / (item.duration + MCP_SCENARIO_HOLD))
                      : 0
                  } 1`,
                }}
              />
            </TabsTrigger>
          ))}
        </TabsList>
        <div className='landing-agent-action'>
          <LandingAction to={signedIn ? ROUTES.home : ROUTES.signUp}>
            {t('landing.agents.link')}
          </LandingAction>
        </div>
      </div>
      <div className='landing-mcp-panels'>
        {scripts.map((item, index) => (
          <TabsContent
            value={item.id}
            key={item.id}
            className='landing-mcp-panel'
          >
            <McpTerminal
              steps={item.steps}
              elapsed={index === playhead.index ? time : 0}
              running={ticking && !complete}
              complete={complete}
              title={t(`landing.agents.scenarios.${item.id}.title`)}
              status={t(`landing.agents.scenarios.${item.id}.status`)}
            />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
