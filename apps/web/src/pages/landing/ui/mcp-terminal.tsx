import { Code2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { isTypedLine, type TerminalLineKind } from '../model/mcp-scenarios';

export type TerminalStep = {
  readonly kind: TerminalLineKind;
  readonly key: string;
  readonly text: string;
  readonly start: number;
  readonly end: number;
};

const PREFIX: Record<TerminalLineKind, string> = {
  prompt: '>',
  system: '',
  call: '→',
  output: ' ',
  warning: '!',
  answer: '»',
  human: '>',
};

/** Plain terminal output; geometry stays stable while each line is typed or received. */
export function McpTerminal({
  steps,
  elapsed,
  running,
  complete,
  title,
  status,
}: {
  readonly steps: readonly TerminalStep[];
  readonly elapsed: number;
  readonly running: boolean;
  readonly complete: boolean;
  readonly title: string;
  readonly status: string;
}) {
  const { t } = useTranslation();
  return (
    <div
      className='landing-terminal landing-mcp-terminal'
      data-running={running}
      data-stage={complete ? 'ready' : 'playing'}
    >
      <div className='landing-terminal-header'>
        <Code2 size={16} aria-hidden />
        <span>orbit / intentra</span>
        <code>MCP</code>
      </div>
      <div className='landing-terminal-content' aria-label={title}>
        {steps.map(step => {
          const visible = elapsed >= step.start;
          const typing = isTypedLine(step.kind);
          const progress = Math.max(
            0,
            Math.min(1, (elapsed - step.start) / (step.end - step.start)),
          );
          const text = typing
            ? step.text.slice(0, Math.floor(step.text.length * progress))
            : step.text;
          return (
            <div
              key={step.key}
              className='landing-terminal-line'
              data-kind={step.kind}
              data-visible={visible}
              aria-hidden={!visible}
            >
              <span className='landing-terminal-prefix' aria-hidden>
                {PREFIX[step.kind]}
              </span>
              <span className='landing-terminal-type'>
                <span className='landing-terminal-type-measure' aria-hidden>
                  {step.text}
                </span>
                <span className='landing-terminal-type-ink' aria-hidden>
                  {text}
                  {typing && progress < 1 && visible && (
                    <span className='landing-terminal-caret' />
                  )}
                </span>
                <span className='sr-only'>
                  {step.kind === 'human' && `${t('landing.agents.human')}: `}
                  {step.text}
                </span>
              </span>
            </div>
          );
        })}
      </div>
      <div className='landing-mcp-footer'>
        <span className='landing-mcp-status'>
          {complete ? status : t('landing.agents.working')}
        </span>
        <code>{t('landing.agents.transport')}</code>
      </div>
    </div>
  );
}
