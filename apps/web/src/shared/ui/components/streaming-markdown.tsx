import { Streamdown, type Components } from 'streamdown';

import { cn } from '@/shared/lib';

import {
  BLOCK_COMPONENTS,
  link,
  withReferences,
  type Linkify,
} from './markdown';

/**
 * An answer streamed from a model, rendered as Markdown while it arrives:
 * unfinished syntax is completed rather than shown raw, references (such as
 * Knowledge Keys) become links, and external links open in a new tab.
 */
export function StreamingMarkdown({
  children,
  linkify,
  streaming = false,
  className,
}: {
  readonly children: string;
  readonly linkify?: Linkify;
  /** Still arriving: the text may end mid-way through a construct. */
  readonly streaming?: boolean;
  readonly className?: string;
}) {
  const components = {
    ...BLOCK_COMPONENTS,
    a: link(linkify),
  } as Components;

  return (
    <Streamdown
      mode={streaming ? 'streaming' : 'static'}
      isAnimating={streaming}
      parseIncompleteMarkdown
      controls={{ table: false, code: true, mermaid: false }}
      linkSafety={{ enabled: false }}
      components={components}
      className={cn(
        // Streamdown's own `space-y-4` would add to the gap.
        'flex max-w-[68ch] min-w-0 flex-col gap-3 space-y-0 text-sm leading-6 break-words',
        className,
      )}
    >
      {withReferences(children, linkify)}
    </Streamdown>
  );
}
