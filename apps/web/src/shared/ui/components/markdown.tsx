import { Fragment, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

import { cn, linkReferences } from '@/shared/lib';

/** People and agents write a single line break meaning a new line. */
const BLOCK_PLUGINS = [remarkGfm, remarkBreaks];
const INLINE_PLUGINS = [remarkGfm];

/** Marks a link the text itself names, such as a Knowledge Key, among ordinary ones. */
const REFERENCE_HREF = '#ref:';

/**
 * Words in the text that open something in the app, such as Knowledge Keys:
 * each match becomes whatever `render` returns.
 */
export type Linkify = {
  readonly pattern: RegExp;
  readonly render: (match: string) => ReactNode;
};

/** Turns each match into a Markdown link the renderer recognises; code, links and URLs are left alone. */
export function withReferences(
  text: string,
  linkify: Linkify | undefined,
): string {
  return linkify
    ? linkReferences(
        text,
        linkify.pattern,
        match => `${REFERENCE_HREF}${match}`,
      )
    : text;
}

export function link(linkify: Linkify | undefined): Components['a'] {
  return ({ href, children }) => {
    if (linkify && href?.startsWith(REFERENCE_HREF)) {
      return <>{linkify.render(href.slice(REFERENCE_HREF.length))}</>;
    }
    return (
      <a
        href={href}
        target='_blank'
        rel='noreferrer noopener'
        className='underline underline-offset-[0.2em]'
      >
        {children}
      </a>
    );
  };
}

/** How block Markdown is set at the app's body size, shared by the streamed renderer. */
export const BLOCK_COMPONENTS: Components = {
  p: ({ children }) => <p className='text-pretty'>{children}</p>,
  ul: ({ children }) => (
    <ul className='flex list-disc flex-col gap-1 pl-5 marker:text-muted-foreground'>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className='flex list-decimal flex-col gap-1 pl-5 marker:font-mono marker:text-xs marker:text-muted-foreground'>
      {children}
    </ol>
  ),
  li: ({ children }) => <li className='pl-0.5'>{children}</li>,
  h1: ({ children }) => <p className='font-semibold'>{children}</p>,
  h2: ({ children }) => <p className='font-semibold'>{children}</p>,
  h3: ({ children }) => <p className='font-semibold'>{children}</p>,
  h4: ({ children }) => <p className='font-medium'>{children}</p>,
  blockquote: ({ children }) => (
    <blockquote className='border-l border-border pl-3 text-muted-foreground'>
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => (
    <code
      className={cn(
        'rounded-md bg-muted px-1 py-0.5 font-mono text-[0.85em]',
        className,
      )}
    >
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className='overflow-x-auto rounded-lg border border-border bg-muted/50 p-3 font-mono text-xs leading-5 [&_code]:bg-transparent [&_code]:p-0'>
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className='overflow-x-auto rounded-lg border border-border'>
      <table className='w-full text-left text-sm'>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className='border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground'>
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className='border-b border-border px-3 py-2 align-top'>{children}</td>
  ),
  hr: () => <hr className='border-border' />,
  strong: ({ children }) => (
    <strong className='font-semibold'>{children}</strong>
  ),
};

/**
 * Text people and agents write in Knowledge Items, rendered from Markdown:
 * paragraphs, lists, emphasis, code and tables at the app's body size, and
 * references (such as Knowledge Keys) turned into links.
 */
export function Markdown({
  children,
  linkify,
  className,
}: {
  readonly children: string;
  readonly linkify?: Linkify;
  readonly className?: string;
}) {
  return (
    <div
      className={cn(
        'flex max-w-[68ch] flex-col gap-2.5 text-sm leading-6 break-words',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={BLOCK_PLUGINS}
        components={{ ...BLOCK_COMPONENTS, a: link(linkify) }}
      >
        {withReferences(children, linkify)}
      </ReactMarkdown>
    </div>
  );
}

const inline =
  (className?: string) =>
  ({ children }: { children?: ReactNode }) => (
    <Fragment>
      <span className={className}>{children}</span>{' '}
    </Fragment>
  );

/**
 * Markdown flattened to one run of text, for previews that clamp lines and
 * often sit inside a link: emphasis and code stay, blocks and links do not.
 */
const INLINE_COMPONENTS: Components = {
  p: inline(),
  h1: inline('font-medium'),
  h2: inline('font-medium'),
  h3: inline('font-medium'),
  h4: inline('font-medium'),
  h5: inline('font-medium'),
  h6: inline('font-medium'),
  ul: inline(),
  ol: inline(),
  li: inline(),
  blockquote: inline(),
  pre: inline(),
  table: inline(),
  thead: inline(),
  tbody: inline(),
  tr: inline(),
  th: inline(),
  td: inline(),
  a: inline(),
  br: () => ' ',
  hr: () => ' ',
  img: ({ alt }) => <span>{alt}</span>,
  code: ({ children }) => (
    <code className='rounded-md bg-muted px-1 font-mono text-[0.85em]'>
      {children}
    </code>
  ),
  strong: ({ children }) => (
    <strong className='font-semibold'>{children}</strong>
  ),
};

/** A Markdown text as one line of plain inline text, for rows and previews. */
export function InlineMarkdown({
  children,
  className,
}: {
  readonly children: string;
  readonly className?: string;
}) {
  return (
    <span className={className}>
      <ReactMarkdown
        remarkPlugins={INLINE_PLUGINS}
        components={INLINE_COMPONENTS}
      >
        {children}
      </ReactMarkdown>
    </span>
  );
}
