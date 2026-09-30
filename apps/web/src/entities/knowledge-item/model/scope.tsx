import { createContext, useContext, type ReactNode } from 'react';

import type { InProject } from '../api/knowledge-api';

export type KnowledgeScope = InProject & {
  /** The path of a Knowledge Item's page in this Project. */
  readonly itemPath: (key: string) => string;
};

const ScopeContext = createContext<KnowledgeScope | null>(null);

/**
 * The Project that Knowledge Keys on a page belong to, so that a key anywhere
 * in the page (in a text, a Link, a preview) opens and previews its item.
 */
export function KnowledgeScopeProvider({
  scope,
  children,
}: {
  readonly scope: KnowledgeScope;
  readonly children: ReactNode;
}) {
  return <ScopeContext value={scope}>{children}</ScopeContext>;
}

export function useKnowledgeScope(): KnowledgeScope {
  const scope = useContext(ScopeContext);
  if (!scope) {
    throw new Error('A Knowledge Key is shown outside KnowledgeScopeProvider');
  }
  return scope;
}
