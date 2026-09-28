import { MongoMemoryServer } from 'mongodb-memory-server';
import type { TestProject } from 'vitest/node';

import './provided-context.js';

export default async function setup(project: TestProject) {
  const server = await MongoMemoryServer.create();
  project.provide('databaseUri', server.getUri());

  return async () => {
    await server.stop();
  };
}
