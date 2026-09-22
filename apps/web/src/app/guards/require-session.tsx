import { Navigate, Outlet, useLocation } from 'react-router';

import { hasStoredSession, useSessionExpired } from '@/shared/session';

/**
 * Пускает дальше только того, у кого есть чем войти.
 *
 * Токен здесь не проверяется: годен он или нет, знает сервер, и первый же
 * запрос за экраном это выяснит. Здесь решается другое — показывать приложение
 * или форму входа, — и для этого достаточно знать, есть ли сессия вообще.
 *
 * `useSessionExpired` нужен для второго случая: продление упало посреди работы,
 * токены стёрты, и человека надо вывести, не дожидаясь перезагрузки страницы.
 */
export function RequireSession() {
  const expired = useSessionExpired();
  const location = useLocation();

  if (expired || !hasStoredSession()) {
    /* Куда человек шёл — в состоянии перехода: после входа вернём его туда,
       а не на общий экран. */
    return (
      <Navigate
        to='/auth/sign-in'
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
