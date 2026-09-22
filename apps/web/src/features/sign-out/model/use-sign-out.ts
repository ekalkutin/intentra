import { useNavigate } from 'react-router';

import { useAppDispatch } from '@/app/store';
import { api } from '@/shared/api';
import { clearTokens } from '@/shared/session';

/**
 * Выход из системы.
 *
 * Серверного вызова нет, и это не упущение: `RefreshToken` не хранится и не
 * отзывается, поэтому «выйти» здесь означает забыть токены. Настоящий отзыв
 * появится вместе с блокировкой аккаунта.
 *
 * Кеш запросов сбрасывается вместе с токенами: иначе следующий вошедший
 * увидел бы на первом кадре данные предыдущего.
 */
export function useSignOut(): () => void {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return () => {
    clearTokens();
    dispatch(api.util.resetApiState());
    void navigate('/auth/sign-in', { replace: true });
  };
}
