import { useNavigate } from 'react-router';

import { storeTokens } from '@/shared/session';
import type { SignInDto, TokensDto } from '@intentra/iam-contracts';

type Submit = (dto: SignInDto) => { unwrap: () => Promise<TokensDto> };

/**
 * Общее для входа и регистрации: оба возвращают одну и ту же пару токенов и
 * оба ведут в приложение. Разница между ними — только адрес и подпись кнопки,
 * поэтому дублировать этот кусок было бы нечестно.
 */
export function useAuthSubmit(
  submit: Submit,
): (dto: SignInDto) => Promise<void> {
  const navigate = useNavigate();

  return async (dto: SignInDto) => {
    const tokens = await submit(dto).unwrap();

    storeTokens(tokens);
    /* `replace`, а не push: возвращаться кнопкой «назад» на форму входа, уже
       войдя, — не то, чего человек хочет. */
    await navigate('/dashboard', { replace: true });
  };
}
