import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
  type Provider,
} from '@nestjs/common';

import { AnalysisRunsService } from '../../../application/services/index.js';
import { AGENTS_OPTIONS, type AgentsOptions } from '../../runtime/index.js';

const HOUR_MS = 60 * 60 * 1000;

/**
 * Starts the nightly Analysis Runs every day at the configured hour (UTC), in
 * this process. A night whose runs are still going when the next one comes is
 * skipped. With several API instances each would start them; the one-running-
 * run-per-Project rule keeps a Project from being checked twice at once.
 */
@Injectable()
export class AnalysisScheduler
  implements OnApplicationBootstrap, OnModuleDestroy
{
  readonly #logger = new Logger(AnalysisScheduler.name);
  #timer: NodeJS.Timeout | null = null;
  #running = false;

  constructor(
    @Inject(AGENTS_OPTIONS) private readonly options: AgentsOptions,
    private readonly analysisRunsService: AnalysisRunsService,
  ) {}

  public onApplicationBootstrap(): void {
    this.planNext();
  }

  public onModuleDestroy(): void {
    if (this.#timer) {
      clearTimeout(this.#timer);
      this.#timer = null;
    }
  }

  private planNext(): void {
    const hour = this.options.analysisScheduleHourUtc;
    if (hour === null) {
      return;
    }
    this.#timer = setTimeout(
      () => void this.runNight(),
      untilNext(hour, Date.now()),
    );
    this.#timer.unref();
  }

  private async runNight(): Promise<void> {
    if (!this.#running) {
      this.#running = true;
      try {
        await this.analysisRunsService.runScheduled();
      } catch (error) {
        this.#logger.error(error);
      } finally {
        this.#running = false;
      }
    }
    this.planNext();
  }
}

/** Milliseconds from `now` to the next start of the hour `hour` UTC, never zero. */
export function untilNext(hour: number, now: number): number {
  const next = new Date(now);
  next.setUTCHours(hour, 0, 0, 0);
  if (next.getTime() <= now) {
    next.setTime(next.getTime() + 24 * HOUR_MS);
  }

  return next.getTime() - now;
}

export const ANALYSIS_SCHEDULER_PROVIDER: Provider = AnalysisScheduler;
