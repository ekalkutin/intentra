// @ts-nocheck
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import * as Types from '../../../../app/graphql';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type CreateWorkspaceInput = {
  alias: string;
  name: string;
};

export type CreateWorkspaceMutationVariables = Exact<{
  input: Types.CreateWorkspaceInput;
}>;


export type CreateWorkspaceMutation = { createWorkspace: { __typename: 'Workspace', id: string, name: string, alias: string } };


export const CreateWorkspaceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateWorkspace"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateWorkspaceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createWorkspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"alias"}}]}}]}}]} as unknown as DocumentNode<CreateWorkspaceMutation, CreateWorkspaceMutationVariables>;