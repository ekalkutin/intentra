import { describe, expect, it } from 'vitest';

import {
  BaseException,
  ConflictException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from './index.js';

describe('exceptions', () => {
  it('are errors named after their class', () => {
    const exception = new NotFoundException('missing', 'THING_NOT_FOUND');

    expect(exception).toBeInstanceOf(Error);
    expect(exception).toBeInstanceOf(BaseException);
    expect(exception).toMatchObject({
      name: 'NotFoundException',
      message: 'missing',
      code: 'THING_NOT_FOUND',
      retryable: false,
    });
  });

  it('carry the status of their class', () => {
    expect(new NotFoundException('', 'X').status).toBe(HttpStatus.NOT_FOUND);
    expect(new UnauthorizedException('', 'X').status).toBe(
      HttpStatus.UNAUTHORIZED,
    );
    expect(new ConflictException('', 'X').status).toBe(HttpStatus.CONFLICT);
  });
});
