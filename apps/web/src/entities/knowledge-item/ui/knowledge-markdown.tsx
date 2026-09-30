import { Markdown, type Linkify } from '@/shared/ui';

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
