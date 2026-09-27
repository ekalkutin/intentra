import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { ROUTES } from '@/shared/config';
import { clearTokens } from '@/shared/session';

export const useSignOut = () => {
  const client = useApolloClient();
  const navigate = useNavigate();

  return useCallback(async () => {
    clearTokens();
    await client.clearStore();
    navigate(ROUTES.AUTH.SIGN_IN, { replace: true });
  }, [client, navigate]);
};
