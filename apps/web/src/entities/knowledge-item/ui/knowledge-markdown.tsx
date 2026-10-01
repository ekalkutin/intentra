import { Markdown, StreamingMarkdown, type Linkify } from '@/shared/ui';

import { KNOWLEDGE_KEY_PATTERN } from '../model/key-prefixes';

import { KnowledgeKeyLink } from './knowledge-key-link';

const LINKIFY: Linkify = {
  pattern: KNOWLEDGE_KEY_PATTERN,
  render: key => <KnowledgeKeyLink itemKey={key} />,
};

/** A Knowledge Item's text as Markdown, the Knowledge Keys in it opening their items. */
export function KnowledgeMarkdown({
  children,
  className,
}: {
  readonly children: string;
  readonly className?: string;
}) {
  return (
    <Markdown linkify={LINKIFY} className={className}>
      {children}
    </Markdown>
  );
}

/** A model's answer streamed as Markdown, the Knowledge Keys in it opening their items. */
export function KnowledgeStreamingMarkdown({
  children,
  streaming,
  className,
}: {
  readonly children: string;
  readonly streaming: boolean;
  readonly className?: string;
}) {
  return (
    <StreamingMarkdown
      linkify={LINKIFY}
      streaming={streaming}
      className={className}
    >
      {children}
    </StreamingMarkdown>
  );
}
