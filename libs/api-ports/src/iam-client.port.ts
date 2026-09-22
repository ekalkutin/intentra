import { IamApi } from '@intentra/iam-contracts';

/**
 * Опубликованный API IAM глазами потребителя.
 *
 * Абстрактный класс, а не интерфейс: он же и токен внедрения. Реализацию
 * подставляет композиционный корень — в монолите это сам контекст, после
 * выделения в сервис им станет RPC-клиент, и переписывать потребителей не
 * придётся.
 */
export abstract class IamClientPort implements IamApi {
  abstract readonly auth: IamApi['auth'];
}
