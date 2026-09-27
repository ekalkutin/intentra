// @ts-nocheck
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import * as Types from '../../../../app/graphql';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AgentProfileOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type AgentProfileOptionsQuery = { models: Array<{ __typename: 'Model', id: string, name: string, contextLength: number | null }>, agentTools: Array<{ __typename: 'AgentTool', id: string, description: string }> };


export const AgentProfileOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AgentProfileOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"models"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"contextLength"}}]}},{"kind":"Field","name":{"kind":"Name","value":"agentTools"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<AgentProfileOptionsQuery, AgentProfileOptionsQueryVariables>;