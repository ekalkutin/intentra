import { MastraCompositeStore } from '@mastra/core/storage';
import { Memory } from '@mastra/memory';
import { MemoryStorageMongoDB, type ConnectorHandler } from '@mastra/mongodb';
import type { Provider } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';

import { AGENTS_OPTIONS, type AgentsOptions } from './agents-options.js';

/** Mastra's collections live in our database, reached through Mongoose's connection. */
function connectorHandler(connection: Connection): ConnectorHandler {
  return {
    // Mongoose and Mastra each bring their own copy of the driver's types.
    getCollection: async name =>
      connection
        .getClient()
        .db(connection.name)
        .collection(name) as unknown as Awaited<
        ReturnType<ConnectorHandler['getCollection']>
      >,
    // The connection is Mongoose's to close.
    close: async () => undefined,
  };
}

/**
 * Where Conversations and their messages are kept: Mastra Memory, with only
 * its memory collections (`mastra_threads`, `mastra_messages`, …).
 */
/** A model left alone sometimes answers instead of naming the Conversation. */
const TITLE_INSTRUCTIONS =
  'Name this conversation in at most six words, in the language the person writes in. Reply with the title alone: one line, no quotes, no Markdown, no punctuation at the end.';

export const MEMORY_PROVIDER: Provider = {
  provide: Memory,
  inject: [getConnectionToken(), AGENTS_OPTIONS],
  useFactory: (connection: Connection, options: AgentsOptions): Memory =>
    new Memory({
      storage: new MastraCompositeStore({
        id: 'agents',
        domains: {
          memory: new MemoryStorageMongoDB({
            connectorHandler: connectorHandler(connection),
          }),
        },
      }),
      options: {
        lastMessages: options.historyMessages,
        messageHistory: { maxTokens: options.historyTokens },
        // The title comes after the answer, in the background: the answer
        // never waits for it, and the web app asks for it again.
        generateTitle: { instructions: TITLE_INSTRUCTIONS },
      },
    }),
};
