import { NotFoundException } from '@intentra/shared';

export class OpenRouterKeyNotFoundException extends NotFoundException<'OPEN_ROUTER_KEY_NOT_FOUND'> {
  constructor(workspaceId: string) {
    super(
      `Workspace ${workspaceId} has no OpenRouter key. Set one in the workspace settings`,
      'OPEN_ROUTER_KEY_NOT_FOUND',
    );
  }
}
