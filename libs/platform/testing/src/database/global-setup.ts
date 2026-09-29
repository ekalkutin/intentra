import { MongoMemoryReplSet } from 'mongodb-memory-server';
import type { TestProject } from 'vitest/node';

import './provided-context.js';

export default async function setup(project: TestProject) {
  const server = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  project.provide('databaseUri', server.getUri());

  return async () => {
    await server.stop();
  };
}
