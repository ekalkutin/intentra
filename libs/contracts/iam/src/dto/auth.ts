import { z } from 'zod';

const password = z
  .string()
  .min(1, 'Введите пароль')
  .min(8, 'Слишком короткий — нужно не менее 8 символов')
  .max(32, 'Слишком длинный — не более 32 символов');

const email = z.email('Введите корректный адрес эл. почты');

export const SignUpSchema = z.object({ email, password });
export type SignUpDto = z.infer<typeof SignUpSchema>;

export const SignInSchema = z.object({ email, password });
export type SignInDto = z.infer<typeof SignInSchema>;

export const RefreshTokenSchema = z.object({ refresh_token: z.string() });
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;

export const TokensSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});
export type TokensDto = z.infer<typeof TokensSchema>;

export const AccessTokenPayloadSchema = z.object({
  /** Который из пары: refresh никогда не должен пройти как access, и наоборот. */
  typ: z.literal('access'),
  sub: z.uuid(),
  email: z.email(),
  /** Стандартные claims JWT — по ним потребитель согласует свои кеши со сроком токена. */
  iat: z.number().optional(),
  exp: z.number().optional(),
});
export type AccessTokenPayload = z.infer<typeof AccessTokenPayloadSchema>;

export const VerifyAccessTokenSchema = z.object({ token: z.string() });
export type VerifyAccessTokenDto = z.infer<typeof VerifyAccessTokenSchema>;
