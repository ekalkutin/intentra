import type { AgentsContent } from '../../../domain/entities/index.js';

/** The Agents as the code held them before they became data: Agents Version 1. */
export abstract class FirstAgentsVersion {
  abstract content(): AgentsContent;
}
