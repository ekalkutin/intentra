import { mongo } from 'mongoose';

const DUPLICATE_KEY_ERROR_CODE = 11000;

/** The write broke a unique index. */
export function isDuplicateKeyError(error: unknown): boolean {
  return (
    error instanceof mongo.MongoServerError &&
    error.code === DUPLICATE_KEY_ERROR_CODE
  );
}
