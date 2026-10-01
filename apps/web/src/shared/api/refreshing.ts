import { Mutex } from 'async-mutex';

/** One refresh at a time: requests that fail together wait for the same new pair. */
export const refreshing = new Mutex();
