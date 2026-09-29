import { noopObserve } from '@mastra/core/tools';
import { describe, expect, it } from 'vitest';

import { echoTool } from './echo.tool.js';

describe('echo', () => {
  it('returns the given message', async () => {
    // Arrange
    const input = { message: 'hello' };

    // Act
    const result = await echoTool.execute?.(input, { observe: noopObserve });

    // Assert
    expect(result).toEqual({ message: 'hello' });
  });
});
