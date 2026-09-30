import type { ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';

/** People and agents write single line breaks meaning a new line. */
const PLUGINS = [remarkGfm, remarkBreaks];

const BLOCK_COMPONENTS: Components = {
  a: ({ node: _node, ...props }) => (
    <a {...props} target='_blank' rel='noreferrer noopener' />
  ),
};

/**
 * Knowledge texts and assistant answers may carry Markdown: lists, emphasis,
 * code, tables. Rendered with the typography plugin's reading rhythm.
 */
export function Markdown({
  children,
  size = 'base',
  className,
}: {
  children: string;
  size?: 'sm' | 'base';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'prose max-w-none',
        size === 'sm'
          ? 'prose-sm leading-relaxed'
          : 'text-[15px] leading-7 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-headings:mt-4 prose-headings:mb-2',
        'prose-pre:rounded-lg prose-pre:text-[13px] prose-table:text-sm',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={PLUGINS} components={BLOCK_COMPONENTS}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

const span =
  (className?: string) =>
  ({ children }: { children?: ReactNode }) => (
    <span className={className}>{children} </span>
  );

/**
 * Markdown flattened to one run of inline text, for previews that clamp lines
 * and often sit inside a link: emphasis and code stay, blocks and links do not.
 */
const INLINE_COMPONENTS: Components = {
  p: span(),
  h1: span('font-medium'),
  h2: span('font-medium'),
  h3: span('font-medium'),
  h4: span('font-medium'),
  h5: span('font-medium'),
  h6: span('font-medium'),
  ul: span(),
  ol: span(),
  li: ({ children }) => <span>• {children} </span>,
  blockquote: span('italic'),
  pre: span(),
  code: ({ children }) => (
    <code className='rounded bg-muted px-1 font-mono text-[0.9em]'>
      {children}
    </code>
  ),
  a: span('underline decoration-muted-foreground/40 underline-offset-2'),
  br: () => ' ',
  hr: () => ' ',
  table: span(),
  thead: span(),
  tbody: span(),
  tr: span(),
  th: span(),
  td: span(),
  img: ({ alt }) => <span>{alt}</span>,
  strong: ({ children }) => (
    <strong className='font-semibold text-foreground/90'>{children}</strong>
  ),
};

export function InlineMarkdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <span className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={INLINE_COMPONENTS}>
        {children}
      </ReactMarkdown>
    </span>
  );
}
