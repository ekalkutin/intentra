import { Check, ChevronDown, Copy } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn, useCopy } from '@/shared/lib';
import { Button } from '@/shared/ui';

import { maskSecret, mcpConnection, mcpUrl } from '../model/mcp';

/**
 * A ready prompt that connects Claude Code or Codex to Intentra with the new
 * token: its first lines fading out, the rest on demand. The preview hides
 * most of the secret; the copy carries it whole.
 */
export function AgentPrompt({
  workspaceSlug,
  secret,
}: {
  readonly workspaceSlug: string;
  readonly secret: string;
}) {
  const { t } = useTranslation();
  const id = useId();
  const { copied, copy } = useCopy();
  const [expanded, setExpanded] = useState(false);
  const url = mcpUrl(workspaceSlug);
  const connection = mcpConnection(workspaceSlug);
  const prompt = (token: string) =>
    t('tokens.prompt', { url, token, ...connection });

  return (
    <section className='flex flex-col gap-3 border-t border-border pt-5'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex min-w-0 flex-col gap-0.5'>
          <h3 className='text-sm font-medium'>{t('tokens.connectTitle')}</h3>
          <p className='text-sm text-pretty text-muted-foreground'>
            {t('tokens.connectDescription')}
          </p>
        </div>
        <Button
          variant='outline'
          size='sm'
          className='shrink-0'
          onClick={() => void copy(prompt(secret))}
        >
          {copied ? <Check /> : <Copy />}
          {copied ? t('tokens.promptCopied') : t('tokens.copyPrompt')}
        </Button>
      </div>
      <div className='overflow-hidden rounded-lg border border-border bg-muted/50'>
        <pre
          id={id}
          aria-label={t('tokens.promptLabel')}
          className={cn(
            'p-3 font-mono text-xs leading-5 whitespace-pre-wrap text-foreground/80 [overflow-wrap:anywhere]',
            // Four lines, fading out, until it is opened.
            !expanded &&
              'max-h-[6.5rem] overflow-hidden [mask-image:linear-gradient(to_bottom,black_45%,transparent)]',
          )}
        >
          {prompt(maskSecret(secret))}
        </pre>
        <button
          type='button'
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded(open => !open)}
          className='flex w-full items-center justify-center gap-1 border-t border-border py-1.5 text-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset'
        >
          {expanded ? t('tokens.promptCollapse') : t('tokens.promptExpand')}
          <ChevronDown
            aria-hidden
            className={cn(
              'size-3.5 transition-transform',
              expanded && 'rotate-180',
            )}
          />
        </button>
      </div>
    </section>
  );
}
