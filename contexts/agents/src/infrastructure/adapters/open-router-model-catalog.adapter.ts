import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import {
  ModelCatalog,
  type CatalogModel,
} from '../../application/ports/index.js';

import { OPEN_ROUTER_URL } from './open-router.js';

const CACHE_MS = 60 * 60 * 1000;

const ModelsResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      context_length: z.number().nullish(),
    }),
  ),
});

/**
 * The public list of OpenRouter models, which needs no key. Kept for an hour:
 * it changes rarely and a form asks for it every time it opens.
 */
@Injectable()
export class OpenRouterModelCatalogAdapter extends ModelCatalog {
  #cached: {
    readonly models: readonly CatalogModel[];
    readonly at: number;
  } | null = null;

  public async find(): Promise<readonly CatalogModel[]> {
    if (this.#cached && Date.now() - this.#cached.at < CACHE_MS) {
      return this.#cached.models;
    }

    const response = await fetch(`${OPEN_ROUTER_URL}/models`);
    if (!response.ok) {
      throw new Error(`OpenRouter answered ${response.status} for the models`);
    }
    const { data } = ModelsResponseSchema.parse(await response.json());
    const models = data
      .map(model => ({
        id: model.id,
        name: model.name,
        contextLength: model.context_length ?? null,
      }))
      .toSorted((a, b) => a.name.localeCompare(b.name));

    this.#cached = { models, at: Date.now() };
    return models;
  }
}
