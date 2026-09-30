import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { endSession } from '@/entities/session';
import { baseApi } from '@/shared/api';

/** Forgets the session and everything loaded with it; the app then goes to the sign-in page. */
export function useSignOut(): () => void {
  const dispatch = useDispatch();

  return useCallback(() => {
    endSession();
    dispatch(baseApi.util.resetApiState());
  }, [dispatch]);
}
