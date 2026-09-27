/**
 * The shape of `BaseException` from the shared kernel. The gateway may not
 * import the kernel, so it recognizes the shape instead of the class; that
 * also holds once a context answers over the wire, where no class survives.
 */
export type ExpectedException = Error & {
  readonly code: string;
  readonly status: number;
  readonly retryable: boolean;
};

export function isExpectedException(
  error: unknown,
): error is ExpectedException {
  if (!(error instanceof Error)) {
    return false;
  }
  const { code, status, retryable } = error as Partial<ExpectedException>;
  return (
    typeof code === 'string' &&
    typeof status === 'number' &&
    typeof retryable === 'boolean'
  );
}
