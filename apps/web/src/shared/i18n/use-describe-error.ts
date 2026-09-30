import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import type { ApiError } from '../api';

import { describeError, type DescribedError } from './describe-error';
import type { ru } from './locales/ru';

type ErrorKey = `errors.${keyof typeof ru.errors}`;

/** `describeError` with the app's texts. */
export function useDescribeError(): <Field extends string>(
  error: ApiError,
  fieldsByCode?: Readonly<Partial<Record<string, Field>>>,
) => DescribedError<Field> {
  const { i18n } = useTranslation();

  return useCallback(
    (error, fieldsByCode = {}) =>
      describeError(error, fieldsByCode, {
        // A code comes from the server: `describeError` asks `exists` before `t`.
        t: key => i18n.t(key as ErrorKey),
        exists: key => i18n.exists(key),
      }),
    [i18n],
  );
}
