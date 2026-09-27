import type { TokensDto } from '@intentra/contracts/iam';

const ACCESS_TOKEN_KEY = 'intentra.access-token';
const REFRESH_TOKEN_KEY = 'intentra.refresh-token';

export const readAccessToken = (): string | null =>
  localStorage.getItem(ACCESS_TOKEN_KEY);

export const writeTokens = ({ accessToken, refreshToken }: TokensDto) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
