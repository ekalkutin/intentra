import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { endSession } from '@/entities/session';
import { baseApi } from '@/shared/api';
import { Button } from '@/shared/ui';

/** Forgets the session and everything loaded with it; the app then goes to the sign-in page. */
export function SignOutButton() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const signOut = () => {
    endSession();
    dispatch(baseApi.util.resetApiState());
  };

  return (
    <Button variant='outline' onClick={signOut}>
      <LogOut />
      {t('signOut.submit')}
    </Button>
  );
}
