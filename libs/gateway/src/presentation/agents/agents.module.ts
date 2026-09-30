import { DynamicModule, Module, type ModuleMetadata } from '@nestjs/common';

import { ActorGuard } from '../rest/auth/index.js';

import { ChatController } from './chat.controller.js';
import { ChatHandler } from './chat.handler.js';

/** Intentra's own Agents, which people talk to from the web UI. */
@Module({})
export class AgentsModule {
  static register({
    contexts,
  }: {
    readonly contexts: NonNullable<ModuleMetadata['imports']>;
  }): DynamicModule {
    return {
      module: AgentsModule,
      imports: [...contexts],
      controllers: [ChatController],
      providers: [ActorGuard, ChatHandler],
    };
  }
}
