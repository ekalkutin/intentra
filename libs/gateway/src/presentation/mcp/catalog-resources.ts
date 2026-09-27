import {
  ProtocolError,
  ProtocolErrorCode,
  ResourceTemplate,
  type McpServer,
} from '@modelcontextprotocol/server';

import type {
  Caller,
  ResourceDefinition,
  ToolApis,
} from '@intentra/agent-surface';

const JSON_MIME_TYPE = 'application/json';

/** The catalog resources offered through MCP. */
export function selectMcpResources(
  catalog: readonly ResourceDefinition[],
): readonly ResourceDefinition[] {
  return catalog.filter(resource => resource.exposure.mcp);
}

/**
 * Each resource is a URI template: the client reads a concrete URI, its
 * variables are checked against the params schema (a mismatch is the client's
 * mistake, so it is reported as invalid params), and the content goes back as
 * JSON.
 */
export function registerMcpResources(
  server: McpServer,
  resources: readonly ResourceDefinition[],
  apis: ToolApis,
  caller: Caller,
): void {
  for (const resource of resources) {
    server.registerResource(
      resource.id,
      // No listing of concrete URIs yet; clients read by URI.
      new ResourceTemplate(resource.uriTemplate, { list: undefined }),
      { description: resource.description, mimeType: JSON_MIME_TYPE },
      async (uri, variables) => {
        const params = resource.params.safeParse(variables);
        if (!params.success) {
          throw new ProtocolError(
            ProtocolErrorCode.InvalidParams,
            `Invalid URI for resource ${resource.id}`,
            params.error.issues,
          );
        }
        const content = await resource.read(apis, params.data, caller);
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: JSON_MIME_TYPE,
              text: JSON.stringify(content),
            },
          ],
        };
      },
    );
  }
}
