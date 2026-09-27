import type { z } from 'zod';

import type { Caller, Exposure, ToolApis } from '../surface.js';

const SCHEME = 'intentra://';
const VARIABLE = /\{([^}]*)\}/g;
const VARIABLE_NAME = /^[a-zA-Z][a-zA-Z0-9]*$/;

/**
 * A ready piece of project knowledge an agent gets as a whole, before it starts
 * working: MCP clients read it by URI, Intentra's own agents get it in the
 * context of a run. Unlike a tool, a resource only reads.
 */
export type ResourceDefinition<
  TParams extends z.ZodObject = z.ZodObject,
  TContent extends z.ZodObject = z.ZodObject,
> = {
  /** Public name, `snake_case`. For MCP resources it is part of the public API. */
  readonly id: string;
  /**
   * URI template under `intentra://` with simple `{variable}` parts only, each
   * one a field of `params`:
   * `intentra://workspaces/{workspaceId}/projects/{projectId}/context`.
   */
  readonly uriTemplate: string;
  readonly description: string;
  /** The values of the URI variables; they arrive as strings. */
  readonly params: TParams;
  /**
   * Carries the ids and exact versions of what it includes, so an agent keeps
   * working on the versions it was given (PRD §7.10).
   */
  readonly content: TContent;
  readonly exposure: Exposure;
  read(
    apis: ToolApis,
    params: z.infer<TParams>,
    caller: Caller,
  ): Promise<z.infer<TContent>>;
};

/**
 * Checks the URI template against the params when the catalog loads, so a
 * mistake stops the server at startup instead of failing on the first read.
 */
export function defineResource<
  TParams extends z.ZodObject,
  TContent extends z.ZodObject,
>(
  resource: ResourceDefinition<TParams, TContent>,
): ResourceDefinition<TParams, TContent> {
  const { id, uriTemplate, params } = resource;
  if (!uriTemplate.startsWith(SCHEME)) {
    throw new Error(`Resource ${id}: URI template must start with ${SCHEME}`);
  }

  const variables = [...uriTemplate.matchAll(VARIABLE)].map(
    ([, name = '']) => name,
  );
  const invalid = variables.find(name => !VARIABLE_NAME.test(name));
  if (invalid !== undefined) {
    throw new Error(
      `Resource ${id}: {${invalid}} is not a simple URI template variable`,
    );
  }

  const fields = Object.keys(params.shape);
  const missing = variables.filter(name => !fields.includes(name));
  const unused = fields.filter(name => !variables.includes(name));
  if (missing.length > 0 || unused.length > 0) {
    throw new Error(
      `Resource ${id}: URI variables and params differ` +
        ` (not in params: ${missing.join(', ') || '-'};` +
        ` not in URI: ${unused.join(', ') || '-'})`,
    );
  }

  return resource;
}
