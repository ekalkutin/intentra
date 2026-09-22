import { HttpException, HttpStatus, Logger } from '@nestjs/common';

const logger = new Logger('McpGateway');

/**
 * Отказ одинаков и когда workspace чужой, и когда его нет вовсе: иначе
 * перебор идентификаторов рассказывал бы, что существует, а чего нет.
 */
const REFUSALS: Record<number, string> = {
  [HttpStatus.FORBIDDEN]:
    'Not available to the calling account, or it does not exist.',
  [HttpStatus.NOT_FOUND]:
    'Not available to the calling account, or it does not exist.',
  [HttpStatus.BAD_REQUEST]: 'The request was refused.',
};

/**
 * Что уходит наружу, когда контекст отказал.
 *
 * Наружу — одна фраза. Текст правила написан по-русски и для человека
 * (`libs/contracts`), а всё остальное в исключении — устройство продукта:
 * класс, статус, цепочка причин. Внешнему агенту не положено ни то, ни
 * другое, а непредвиденная ошибка тем более не должна пересказывать ему, на
 * чём именно споткнулась (PRD §7.10).
 *
 * Отличать отказ от поломки приходится по `HttpException`: своих кодов у
 * контрактов пока нет. Когда появятся — меняется этот файл, и только он.
 */
export async function translateRefusal<T>(call: Promise<T>): Promise<T> {
  try {
    return await call;
  } catch (error) {
    if (error instanceof HttpException) {
      throw new Error(
        REFUSALS[error.getStatus()] ?? 'The request was refused.',
      );
    }

    /* Диагноз остаётся в журнале сервера: наружу он не уходит, но и не
       пропадает — иначе непонятная ошибка у агента была бы непонятной и здесь. */
    logger.error('An MCP tool failed', error);

    throw new Error('Internal error.');
  }
}
