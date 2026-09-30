import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

/** The one error shape every REST response of the API uses. */
export type WireError = {
  readonly message: string;
  readonly code: string;
  readonly status: number;
  readonly retryable: boolean;
};

function isWireError(value: unknown): value is WireError {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as WireError).code === 'string' &&
    typeof (value as WireError).message === 'string'
  );
}

/** The API's error code, if the error carries one. */
export function errorCode(error: unknown): string | undefined {
  const data = (error as FetchBaseQueryError | undefined)?.data;
  return isWireError(data) ? data.code : undefined;
}

/** A human-readable message for any error thrown by an RTK Query call. */
export function errorMessage(error: unknown): string {
  if (!error) return 'Что-то пошло не так';
  const e = error as FetchBaseQueryError & { message?: string };
  if (isWireError(e.data)) {
    const friendly = FRIENDLY[e.data.code];
    if (!friendly) return e.data.message;
    // Keep the server's message where it names the Knowledge Keys involved.
    return WITH_DETAILS.has(e.data.code)
      ? `${friendly} ${e.data.message}`
      : friendly;
  }
  if (e.status === 'FETCH_ERROR') {
    return 'Нет связи с API Intentra. Он запущен на :3000?';
  }
  if (typeof e.message === 'string') return e.message;
  return 'Что-то пошло не так';
}

const WITH_DETAILS = new Set([
  'DEPENDENCIES_NOT_APPROVED',
  'KNOWLEDGE_ITEM_LINKED',
  'LINK_TARGET_NOT_CURRENT',
  'LINK_TARGET_NOT_FOUND',
]);

const FRIENDLY: Record<string, string> = {
  // Sign-in and sign-up
  INVALID_CREDENTIALS: 'Неверный email или пароль.',
  ACCOUNT_ALREADY_EXISTS: 'Аккаунт с таким email уже есть. Войдите.',
  INVALID_EMAIL: 'Некорректный email.',
  UNAUTHENTICATED: 'Сессия истекла. Войдите снова.',
  INVALID_REFRESH_TOKEN: 'Сессия истекла. Войдите снова.',
  VALIDATION_FAILED: 'Проверьте заполнение полей.',
  INTERNAL: 'Внутренняя ошибка сервера. Попробуйте ещё раз.',

  // Workspaces, projects, members
  WORKSPACE_NOT_FOUND: 'Пространство не найдено или у вас нет к нему доступа.',
  PROJECT_NOT_FOUND: 'Проект не найден или у вас нет к нему доступа.',
  INVALID_WORKSPACE_NAME: 'Некорректное название пространства.',
  INVALID_PROJECT_NAME: 'Некорректное название проекта.',
  INVALID_WORKSPACE_SLUG:
    'Слаг — от 3 до 15 строчных латинских букв, цифр или одиночных дефисов.',
  INVALID_PROJECT_SLUG:
    'Слаг — от 3 до 15 строчных латинских букв, цифр или одиночных дефисов.',
  WORKSPACE_SLUG_TAKEN: 'Такой слаг уже занят другим пространством.',
  PROJECT_SLUG_TAKEN:
    'Такой слаг уже занят другим проектом в этом пространстве.',
  WORKSPACE_SLUG_MISMATCH: 'Слаг введён неверно — пространство не удалено.',
  PROJECT_SLUG_MISMATCH: 'Слаг введён неверно — проект не удалён.',
  NOT_WORKSPACE_OWNER: 'Это может сделать только Владелец пространства.',
  PROJECT_CREATION_FORBIDDEN:
    'Создавать проекты могут только Владелец или Менеджер.',
  PROJECT_DELETION_FORBIDDEN:
    'Удалить проект может Владелец или Менеджер, который его создал.',
  PROJECT_ROLE_CHANGE_FORBIDDEN:
    'Менять роли в проекте могут Владелец или Сопровождающий проекта.',
  OWNER_PROJECT_ROLE_FIXED: 'Владелец всегда Сопровождающий во всех проектах.',
  LAST_OWNER_CANNOT_LEAVE: 'Последний Владелец не может покинуть пространство.',
  LAST_OWNER_CANNOT_STEP_DOWN:
    'Последний Владелец не может отказаться от роли Владельца.',
  MEMBER_NOT_FOUND: 'Участник не найден.',
  MEMBER_NOT_ACTIVE: 'Этот участник больше не состоит в пространстве.',
  MEMBER_NOT_IN_WORKSPACE: 'Этот человек не участник пространства.',

  // Invitations
  ALREADY_WORKSPACE_MEMBER: 'Этот человек уже участник пространства.',
  INVITATION_ALREADY_PENDING: 'На этот email уже отправлено приглашение.',
  INVITATION_EXPIRED: 'Срок действия приглашения истёк.',
  INVITATION_NOT_PENDING: 'Приглашение уже принято, отклонено или отозвано.',
  INVITATION_NOT_FOUND: 'Приглашение не найдено.',

  // Access tokens
  INVALID_PERSONAL_ACCESS_TOKEN_NAME: 'Некорректное название токена.',
  INVALID_PERSONAL_ACCESS_TOKEN_LIFETIME: 'Недопустимый срок действия токена.',
  PERSONAL_ACCESS_TOKEN_NOT_FOUND: 'Токен доступа не найден.',
  PERSONAL_ACCESS_TOKEN_REVOCATION_FORBIDDEN:
    'Чужие токены может отзывать только Владелец.',

  // Knowledge
  KNOWLEDGE_ITEM_CHANGED:
    'Кто-то изменил этот элемент, пока вы его смотрели. Он обновлён — проверьте и повторите.',
  KNOWLEDGE_ITEM_NOT_FOUND: 'Элемент знаний не найден.',
  KNOWLEDGE_ITEM_NEEDS_REVIEW:
    'Элемент требует проверки: сначала подтвердите, что он всё ещё верен.',
  DEPENDENCIES_NOT_APPROVED:
    'Сначала нужно утвердить то, от чего он зависит (или утвердить вместе).',
  KNOWLEDGE_ITEM_LINKED:
    'На этот элемент ссылаются другие — сначала уберите эти связи.',
  SUPERSEDED_ITEM_NOT_APPROVED:
    'Заменяемый элемент уже не утверждён: его заменили или вывели из употребления.',
  PRODUCT_OVERVIEW_ALREADY_APPROVED:
    'В проекте уже есть утверждённый обзор продукта — предложите его изменение.',
  KNOWLEDGE_ITEM_NOT_DRAFT: 'Это уже не черновик.',
  KNOWLEDGE_ITEM_NOT_APPROVED: 'Элемент не утверждён.',
  KNOWLEDGE_ITEM_NOT_MARKED: 'Элемент не отмечен как требующий проверки.',
  KNOWLEDGE_KIND_MISMATCH: 'Тип элемента изменить нельзя.',
  KNOWLEDGE_RECORDING_FORBIDDEN: 'У вас нет прав записывать знания этого типа.',
  DRAFT_EDITING_FORBIDDEN: 'У вас нет прав редактировать этот черновик.',
  DRAFT_DELETION_FORBIDDEN: 'У вас нет прав удалить этот черновик.',
  DRAFT_APPROVAL_FORBIDDEN: 'Утверждать может только Сопровождающий.',
  DRAFT_REJECTION_FORBIDDEN: 'Отклонять может только Сопровождающий.',
  KNOWLEDGE_RETIREMENT_FORBIDDEN:
    'Выводить из употребления может только Сопровождающий.',
  KNOWLEDGE_CONFIRMATION_FORBIDDEN: 'У вас нет прав подтвердить этот элемент.',
  INVALID_KNOWLEDGE_TITLE: 'Некорректный заголовок.',
  INVALID_KNOWLEDGE_FIELDS: 'Проверьте поля: главное поле обязательно.',
  INVALID_LINK: 'Некорректная связь.',
  LINK_TARGET_NOT_FOUND: 'Цель связи не найдена.',
  LINK_TARGET_NOT_CURRENT:
    'Нельзя ссылаться на отклонённый или устаревший элемент.',
  RATIONALE_REQUIRED: 'Нужно указать обоснование.',

  // Assistant
  AGENT_NOT_CONFIGURED:
    'Ассистент не настроен на сервере: задайте OPENROUTER_API_KEY в .env API и перезапустите его.',
  AGENT_FAILED: 'Ассистент не смог ответить. Попробуйте ещё раз.',
};
