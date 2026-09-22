import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'iam:public';

/**
 * Выводит маршрут из-под глобальной проверки токена. Носить его должны только
 * те эндпойнты, которые токены и выдают.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
