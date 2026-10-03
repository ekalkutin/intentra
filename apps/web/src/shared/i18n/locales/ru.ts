import { landingRu } from './landing-ru';

/** The interface's Russian texts, the full set; English covers only part (ADR 0003). */
export const ru = {
  brand: 'Intentra',
  landing: landingRu,
  fields: {
    email: 'Email',
    password: 'Пароль',
    repeatPassword: 'Повторите пароль',
    passwordHint: 'Не меньше 8 символов.',
    passwordsDiffer: 'Пароли не совпадают',
    personName: 'Имя',
    name: 'Название',
    slug: 'Адрес',
    slugHint:
      'От 3 до 15 символов: латиница, цифры и дефисы. После создания не меняется.',
  },
  validation: {
    required: 'Заполните поле',
    tooShort_one: 'Не меньше {{count}} символа',
    tooShort_few: 'Не меньше {{count}} символов',
    tooShort_many: 'Не меньше {{count}} символов',
    tooShort_other: 'Не меньше {{count}} символа',
    tooLong_one: 'Не больше {{count}} символа',
    tooLong_few: 'Не больше {{count}} символов',
    tooLong_many: 'Не больше {{count}} символов',
    tooLong_other: 'Не больше {{count}} символа',
    email: 'Введите email в формате name@example.com',
  },
  common: {
    cancel: 'Отмена',
    close: 'Закрыть',
    retry: 'Повторить',
    copy: 'Скопировать',
    copied: 'Скопировано',
    you: 'вы',
    never: 'никогда',
    loadFailed: 'Не удалось загрузить',
    done: 'Готово',
    save: 'Сохранить',
    edit: 'Изменить',
    delete: 'Удалить',
  },
  markdownEditor: {
    mode: 'Как показать текст',
    write: 'Текст',
    preview: 'Просмотр',
    empty: 'Текста пока нет.',
    length: '{{length}} / {{max}}',
  },
  signIn: {
    title: 'С возвращением',
    description: 'Войдите в свои пространства.',
    submit: 'Войти',
    noAccount: 'Нет аккаунта?',
    toSignUp: 'Регистрация',
  },
  authArtwork: {
    line1: 'Ваши агенты не умеют читать мысли.',
    line2: 'Теперь им и не нужно.',
  },
  signUp: {
    title: 'Создайте аккаунт',
    description: 'Живой контекст ваших программных проектов.',
    submit: 'Создать аккаунт',
    haveAccount: 'Уже есть аккаунт?',
    signInFailed:
      'Аккаунт создан, но войти не получилось. Войдите на странице входа',
    toSignIn: 'Войти',
  },
  signOut: {
    submit: 'Выйти',
  },
  theme: {
    label: 'Тема',
    system: 'Как в системе',
    light: 'Светлая',
    dark: 'Тёмная',
    switchTo: {
      light: 'Включить светлую тему',
      dark: 'Включить тёмную тему',
    },
  },
  language: {
    switchTo: {
      ru: 'Переключить на русский',
      en: 'Switch to English',
    },
  },
  roles: {
    owner: 'Владелец',
    manager: 'Менеджер',
    none: 'Без роли',
  },
  projectRoles: {
    viewer: 'Читает',
    contributor: 'Пишет',
    maintainer: 'Утверждает',
    viewerHint: 'Видит знания проекта',
    contributorHint: 'Записывает и правит черновики',
    maintainerHint: 'Утверждает и отклоняет знания',
  },
  kinds: {
    'product-overview': 'Обзор продукта',
    goal: 'Цели',
    persona: 'Персоны',
    feature: 'Фичи',
    scenario: 'Сценарии',
    requirement: 'Требования',
    constraint: 'Ограничения',
    term: 'Термины',
    'business-rule': 'Бизнес-правила',
    integration: 'Интеграции',
    decision: 'Решения',
    'open-question': 'Открытые вопросы',
  },
  statuses: {
    draft: 'черновик',
    approved: 'утверждено',
    rejected: 'отклонено',
    obsolete: 'устарело',
  },
  sources: {
    manual: 'вручную',
    'external-agent': 'внешний агент',
    'intentra-agent': 'Intentra',
    'analysis-run': 'Intentra Audit',
  },
  shell: {
    navigation: 'Навигация',
    toggleSidebar: 'Показать или скрыть панель',
    workspace: 'Пространство',
    workspaces: 'Пространства',
    createWorkspace: 'Новое пространство',
    leaveWorkspace: 'Покинуть «{{name}}»',
    projects: 'Проекты',
    createProject: 'Новый проект',
    noProjects: 'Проектов пока нет',
    work: 'Работа',
    noProjectsHint: 'Создайте проект, чтобы начать собирать знания о продукте.',
    workspacePages: {
      projects: 'Проекты',
      members: 'Участники',
      tokens: 'Токены доступа',
      settings: 'Настройки',
    },
    projectPages: {
      passport: 'Паспорт',
      knowledge: 'Знания',
      analysis: 'Анализ',
      interview: 'Интервью',
      roles: 'Участники',
      settings: 'Настройки',
    },
    account: 'Аккаунт',
    accountSettings: 'Настройки аккаунта',
    receivedInvitations: 'Приглашения',
    search: 'Поиск',
    searchPlaceholder: 'Поиск',
    searchEmpty: 'Ничего не нашлось',
    searchTitle: 'Быстрый переход',
    searchDescription: 'Найдите проект, раздел или пространство',
    workspaceMissing: 'Такого пространства нет',
    workspaceMissingHint:
      'Возможно, его удалили или вас в нём больше нет. Выберите другое.',
    projectMissing: 'Такого проекта нет',
    projectMissingHint:
      'Возможно, его удалили. Откройте проект из списка слева.',
    toWorkspaces: 'К пространствам',
  },
  start: {
    welcome: 'Добро пожаловать, {{name}}',
    welcomeAnonymous: 'Добро пожаловать',
    invitedDescription_one:
      'Вас пригласили в пространство. Примите приглашение, и вы сразу окажетесь внутри.',
    invitedDescription_few:
      'Вас пригласили в {{count}} пространства. Примите нужные, и вы сразу окажетесь внутри.',
    invitedDescription_many:
      'Вас пригласили в {{count}} пространств. Примите нужные, и вы сразу окажетесь внутри.',
    invitedDescription_other:
      'Вас пригласили в {{count}} пространства. Примите нужные, и вы сразу окажетесь внутри.',
    createDescription:
      'В пространстве живут ваши проекты и люди, которые над ними работают. Начните со своего.',
    inviteHint:
      'Если вас пригласят на <b>{{email}}</b>, приглашение появится здесь.',
    waitTitle: 'Ждём приглашения',
    waitDescription:
      'Пространства в Intentra создаёт администратор платформы. Попросите владельца пространства пригласить <b>{{email}}</b>, и приглашение появится здесь само.',
    check: 'Проверить',
    noInvitations: 'Приглашений пока нет.',
  },
  createWorkspace: {
    title: 'Новое пространство',
    description: 'Пространство объединяет людей и их проекты.',
    namePlaceholder: 'Например, Acme',
    submit: 'Создать пространство',
  },
  createProject: {
    title: 'Новый проект',
    description:
      'Проект собирает всё, что известно об одном программном продукте.',
    namePlaceholder: 'Например, Биллинг',
    submit: 'Создать проект',
  },
  receivedInvitations: {
    title: 'Приглашения',
    description: 'Пространства, в которые вас пригласили.',
    empty: 'Новых приглашений нет.',
    accept: 'Принять',
    decline: 'Отклонить',
    dates: 'Пришло {{sent}} · действует до {{expires}}',
  },
  projects: {
    title: 'Проекты',
    description: 'Каждый проект — отдельный журнал знаний о продукте.',
    empty: 'В этом пространстве ещё нет проектов.',
    emptyReadOnly:
      'Проектов пока нет. Создать проект может владелец или менеджер.',
    yourAccess: 'Ваш доступ: {{role}}',
  },
  members: {
    title: 'Участники',
    description: 'Кто работает в пространстве и с какой ролью.',
    membersSection: 'Участники',
    remove: 'Убрать из пространства',
    removeTitle: 'Убрать {{email}}?',
    removeDescription:
      'Человек потеряет доступ ко всем проектам пространства, его токены доступа перестанут работать. Записанные им знания останутся.',
    removeConfirm: 'Убрать',
    roleLabel: 'Роль {{email}}',
    invitationsSection: 'Приглашения',
    invitationsDescription:
      'Приглашённый увидит приглашение после входа с этим email.',
    invite: 'Пригласить',
    inviteEmail: 'Email нового участника',
    invitationsEmpty: 'Открытых приглашений нет.',
    revoke: 'Отозвать',
    sent: 'отправлено {{date}}',
  },
  invitationStatuses: {
    pending: 'ждёт ответа',
    accepted: 'принято',
    declined: 'отклонено',
    revoked: 'отозвано',
    expired: 'истекло',
  },
  account: {
    title: 'Настройки аккаунта',
    nameDescription: 'Так вас видят другие участники.',
  },
  workspaceSelect: {
    placeholder: 'Выберите пространство',
  },
  tokens: {
    title: 'Токены доступа',
    description:
      'Токен даёт внешнему агенту доступ к одному пространству от вашего имени.',
    workspaceDescription:
      'Токены, по которым внешние агенты работают в этом пространстве. Свои токены участники создают в настройках аккаунта.',
    workspace: 'Пространство',
    workspaceEmpty: 'В этом пространстве токенов пока нет.',
    noWorkspaces: 'Токен создаётся в пространстве, а у вас их пока нет.',
    copyEndpoint: 'Скопировать адрес MCP',
    mcp: 'MCP',
    endpoint: 'Адрес MCP',
    endpointDescription:
      'Адрес этого пространства: токены других пространств по нему не работают.',
    create: 'Новый токен',
    createTitle: 'Новый токен',
    createDescription:
      'Агент получит не больше, чем ваш доступ в каждом проекте, и не больше выбранного уровня.',
    name: 'Название',
    namePlaceholder: 'Например, Claude Code на ноутбуке',
    level: 'Уровень',
    lifetime: 'Срок действия',
    submit: 'Создать токен',
    empty: 'Токенов пока нет.',
    allTokens: 'Все токены пространства',
    ownTokens: 'Ваши токены',
    created: 'создан <mono>{{date}}</mono>',
    expires: 'действует до <mono>{{date}}</mono>',
    noExpiry: 'бессрочный',
    lastUsed: 'использован <mono>{{date}}</mono>',
    neverUsed: 'ещё не использован',
    revoke: 'Отозвать',
    revokeTitle: 'Отозвать токен «{{name}}»?',
    revokeDescription:
      'Агенты с этим токеном сразу потеряют доступ. Отменить нельзя.',
    revokeConfirm: 'Отозвать',
    secretTitle: 'Токен создан',
    secretDescription:
      'Скопируйте его сейчас: больше мы его не покажем. Храните как пароль.',
    secretDone: 'Готово',
    connectTitle: 'Подключите агента',
    connectDescription:
      'Вставьте промпт агенту или выполните команду сами. Токен уже внутри.',
    clients: {
      'claude-code': 'Claude Code',
      codex: 'Codex',
      cursor: 'Cursor',
      other: 'Другой агент',
    },
    copyPrompt: 'Скопировать промпт',
    copyCommand: 'Скопировать команду',
    copyConfig: 'Скопировать конфигурацию',
    copyDetails: 'Скопировать адрес и заголовок',
    prompts: {
      'claude-code': `Подключи Intentra по MCP: выполни
{{setup}}`,
      codex: `Подключи Intentra по MCP: выполни
{{setup}}`,
      cursor: `Подключи Intentra по MCP: добавь сервер в ~/.cursor/mcp.json (создай файл, если его нет; другие серверы не трогай)
{{setup}}`,
      other: `Подключи Intentra по MCP (Streamable HTTP) под именем {{name}}, адрес и заголовок:
{{setup}}`,
    },
    promptAfter:
      'Сервер заработает после перезапуска сессии: попроси меня перезапустить её. Потом вызови list_projects и назови пространство, к которому подключён.',
  },
  oauthAuthorize: {
    title: '{{client}} просит доступ к Intentra',
    description:
      'Агент будет работать от вашего имени по токену доступа. После разрешения вы вернётесь на {{host}}.',
    descriptionAs:
      'Агент будет работать от имени {{email}} по токену доступа. После разрешения вы вернётесь на {{host}}.',
    workspace: 'Пространство',
    noWorkspaces: 'У вас пока нет пространств.',
    workspaceFromAddress:
      'Агент подключается по адресу этого пространства, поэтому выбрать другое нельзя.',
    notInWorkspace:
      'Агент подключается к пространству «{{slug}}», а вы в нём не состоите. Проверьте адрес MCP в агенте.',
    tokenHint:
      'Токен появится в списке токенов пространства, отозвать его можно в любой момент.',
    allow: 'Разрешить',
    deny: 'Отклонить',
    problemTitle: 'Не удалось подключить агента',
    malformed:
      'В ссылке не хватает данных. Начните подключение в агенте заново.',
  },
  lifetimes: {
    days30: '30 дней',
    days90: '90 дней',
    days365: '1 год',
    never: 'Без срока',
  },
  workspaceSettings: {
    title: 'Настройки пространства',
    about: 'Пространство',
    aboutDescription: 'Название и адрес задаются при создании.',
    leave: 'Покинуть пространство',
    leaveDescription:
      'Вы потеряете доступ к его проектам. Вернуться можно только по новому приглашению.',
    leaveConfirmTitle: 'Покинуть «{{name}}»?',
    leaveConfirm: 'Покинуть',
    danger: 'Удаление',
    delete: 'Удалить пространство',
    deleteDescription:
      'Удалятся все проекты, их знания, участники, приглашения и токены. Отменить нельзя.',
  },
  projectSettings: {
    title: 'Настройки проекта',
    about: 'Проект',
    aboutDescription: 'Название и адрес задаются при создании.',
    danger: 'Удаление',
    delete: 'Удалить проект',
    deleteDescription:
      'Удалятся все знания проекта и доступы к нему. Отменить нельзя.',
    deleteForbidden:
      'Удалить проект может владелец пространства или менеджер, который его создал.',
  },
  confirmBySlug: {
    label: 'Чтобы подтвердить, введите {{slug}}',
  },
  projectAccess: {
    title: 'Участники проекта',
    description:
      'Что каждый участник пространства может делать в этом проекте. Без назначения участник только читает.',
    roleLabel: 'Доступ {{email}}',
    readOnly:
      'Менять доступ может владелец пространства или тот, кто утверждает в этом проекте.',
  },
  analysis: {
    title: 'Анализ',
    description:
      'Intentra по одной проверяет черновики и утверждённые записи проекта и записывает найденное открытыми вопросами. Решать, что верно, остаётся людям.',
    start: 'Проверить непроверенное',
    running: 'Идёт проверка',
    history: 'История проверок',
    emptyTitle: 'Проект ещё не проверяли',
    emptyDescription:
      'Intentra найдёт противоречия и неясности в черновиках и утверждённых записях.',
    emptyNothing:
      'Проверять пока нечего: в проекте нет черновиков и утверждённых записей.',
    bySchedule: 'по расписанию',
    scopes: {
      unchecked: 'непроверенное',
      'whole-project': 'весь проект',
    },
    coverage: {
      progress_one: 'Проверено {{checked}} из {{count}} записи',
      progress_few: 'Проверено {{checked}} из {{count}} записей',
      progress_many: 'Проверено {{checked}} из {{count}} записей',
      progress_other: 'Проверено {{checked}} из {{count}} записи',
      unchecked_one:
        '{{count}} запись ещё не проверена: она появилась или изменилась после последней проверки.',
      unchecked_few:
        '{{count}} записи ещё не проверены: они появились или изменились после последней проверки.',
      unchecked_many:
        '{{count}} записей ещё не проверены: они появились или изменились после последней проверки.',
      unchecked_other:
        '{{count}} записи ещё не проверены: они появились или изменились после последней проверки.',
      allChecked_one: '{{count}} запись проверена',
      allChecked_few: 'Все {{count}} записи проверены',
      allChecked_many: 'Все {{count}} записей проверены',
      allChecked_other: 'Все {{count}} записи проверены',
      allCheckedHint:
        'Проверять пока нечего. Когда записи появятся или изменятся, их можно будет проверить.',
      empty: 'Проверять нечего',
      emptyHint:
        'В проекте нет черновиков и утверждённых записей, кроме открытых вопросов.',
    },
    wholeProject: {
      title: 'Проверка всего проекта',
      hint: 'Intentra заново прочитает каждую запись, даже уже проверенную, на ключе провайдера пространства. Пригодится, когда сменились агенты или их модели.',
      start: 'Проверить всё заново',
    },
    schedule: {
      title: 'Проверять каждую ночь',
      on: 'Каждую ночь Intentra проверяет непроверенные записи: новые и изменённые после прошлой проверки. Если таких нет, ночью ничего не запускается.',
      off: 'Проверка идёт только когда её запускают вручную.',
      onlyMaintainer: 'Переключает тот, кто утверждает в проекте.',
      changeFailed:
        'Не удалось переключить ночную проверку. Обновите страницу и попробуйте ещё раз.',
      blocked: {
        'provider-key-missing':
          'Сейчас ночная проверка не запустится: нет ключа провайдера. Его может добавить владелец пространства в настройках.',
        'agents-not-published':
          'Сейчас ночная проверка не запустится: агенты Intentra ещё не опубликованы.',
      },
    },
    statuses: {
      running: 'Идёт проверка',
      completed: 'Готово',
      failed: 'Не удалось',
    },
    runningHint:
      'Intentra читает знания проекта. Можно уйти со страницы: проверка продолжится.',
    runningProgress_one:
      'Проверено {{checked}} из {{count}} записи. Можно уйти со страницы: проверка продолжится.',
    runningProgress_few:
      'Проверено {{checked}} из {{count}} записей. Можно уйти со страницы: проверка продолжится.',
    runningProgress_many:
      'Проверено {{checked}} из {{count}} записей. Можно уйти со страницы: проверка продолжится.',
    runningProgress_other:
      'Проверено {{checked}} из {{count}} записи. Можно уйти со страницы: проверка продолжится.',
    progressLabel: 'Ход проверки',
    checked_one: 'Проверена {{count}} запись.',
    checked_few: 'Проверено {{count}} записи.',
    checked_many: 'Проверено {{count}} записей.',
    checked_other: 'Проверено {{count}} записи.',
    stoppedHalfway_one:
      'Успела проверить {{checked}} из {{total}}; {{count}} запись осталась непроверенной, её посмотрит следующая проверка.',
    stoppedHalfway_few:
      'Успела проверить {{checked}} из {{total}}; {{count}} записи остались непроверенными, их посмотрит следующая проверка.',
    stoppedHalfway_many:
      'Успела проверить {{checked}} из {{total}}; {{count}} записей остались непроверенными, их посмотрит следующая проверка.',
    stoppedHalfway_other:
      'Успела проверить {{checked}} из {{total}}; {{count}} записи остались непроверенными, их посмотрит следующая проверка.',
    foundNothing: 'Противоречий и неясностей не нашлось.',
    oneWaiting: 'ждёт решения',
    oneSettled: 'разобран',
    allWaiting: 'все ждут решения',
    allSettled: 'все разобраны',
    waiting_one: '{{count}} ждёт решения',
    waiting_few: '{{count}} ждут решения',
    waiting_many: '{{count}} ждут решения',
    waiting_other: '{{count}} ждут решения',
    findingStatuses: {
      draft: 'ждёт решения',
      approved: 'принят',
      rejected: 'отклонён',
      obsolete: 'устарел',
    },
    findingGone: 'Черновик удалили',
    showMore_one: 'Ещё {{count}}',
    showMore_few: 'Ещё {{count}}',
    showMore_many: 'Ещё {{count}}',
    showMore_other: 'Ещё {{count}}',
    showFewer: 'Свернуть',
    found_one: 'Найден {{count}} вопрос',
    found_few: 'Найдено {{count}} вопроса',
    found_many: 'Найдено {{count}} вопросов',
    found_other: 'Найдено {{count}} вопроса',
    foundBeforeFailing_one: 'До сбоя записан {{count}} вопрос',
    foundBeforeFailing_few: 'До сбоя записано {{count}} вопроса',
    foundBeforeFailing_many: 'До сбоя записано {{count}} вопросов',
    foundBeforeFailing_other: 'До сбоя записано {{count}} вопроса',
    stepLimitReached:
      'Проверка упёрлась в предел шагов и могла посмотреть не всё.',
    failures: {
      interrupted: 'Прервалась: сервер перезапустился во время проверки.',
      'provider-key-missing':
        'Нет ключа провайдера: его может добавить владелец пространства в настройках.',
      'agents-not-published':
        'Агенты Intentra ещё не опубликованы. Обратитесь к администратору платформы.',
      'model-unavailable':
        'Модель не ответила: сбой у её провайдера, даже после повторов. Запустите проверку ещё раз.',
      'auditor-failed':
        'Intentra не смогла довести проверку до конца. Попробуйте ещё раз позже.',
    },
  },
  passport: {
    description:
      'Продукт таким, каким его утвердила команда. Черновики появятся здесь, когда их утвердят.',
    contents: 'Содержание',
    findings_one: 'Intentra нашла {{count}} вопрос при проверке',
    findings_few: 'Intentra нашла {{count}} вопроса при проверке',
    findings_many: 'Intentra нашла {{count}} вопросов при проверке',
    findings_other: 'Intentra нашла {{count}} вопроса при проверке',
    written: '{{written}} из {{total}} описано',
    chapters: {
      overview: 'Обзор',
      goals: 'Цели',
      users: 'Пользователи',
      capabilities: 'Возможности и сценарии',
      rules: 'Правила и словарь',
      integrations: 'Интеграции',
      qualities: 'Качества и ограничения',
      decisions: 'Решения и открытые вопросы',
    },
    chapterDescriptions: {
      overview:
        'Что это за продукт, какую проблему решает, для кого и что они получают.',
      goals: 'Чего проект хочет достичь и как понять, что достиг.',
      users: 'Кто пользуется продуктом и что им от него нужно.',
      capabilities:
        'Из каких возможностей состоит продукт: что в каждой можно сделать и какой результат ожидается.',
      rules:
        'Правила, по которым работает продукт, и слова, которыми о нём говорят.',
      integrations: 'С какими внешними системами продукт обменивается данными.',
      qualities: 'Каким продукт должен быть и что задано извне.',
      decisions: 'Что уже решено и почему, и что ещё не решено.',
    },
    functionalRequirements: 'Требования',
    scenariosWithoutFeature: 'Сценарии вне фич',
    functionalWithoutFeature: 'Требования вне фич',
    outOfScope: 'Не входит:',
    featureEmpty: 'В фичу пока ничего не входит.',
    qualityRequirements: 'Требования к качеству',
    notDescribed: 'Пока не описано.',
    moreDetails: 'Подробнее',
    lessDetails: 'Свернуть',
    discuss: 'Обсудить',
    discussLabel: 'Обсудить раздел «{{chapter}}» с Intentra',
    discussPrompt:
      'Давай заполним раздел паспорта «{{chapter}}»: {{about}} Сейчас он пуст. Задавай мне вопросы по одному, предлагай варианты ответа и записывай то, что выясним, черновиками.',
    discussMorePrompt:
      'Давай дополним раздел паспорта «{{chapter}}»: {{about}} Там уже есть: {{items}}. Посмотри, чего не хватает и что противоречит друг другу, задавай мне вопросы по одному, предлагай варианты ответа и записывай новое черновиками.',
    discussMore_one: 'и ещё {{count}}',
    discussMore_few: 'и ещё {{count}}',
    discussMore_many: 'и ещё {{count}}',
    discussMore_other: 'и ещё {{count}}',
    empty:
      'Паспорт пока пуст. Он соберётся из знаний, которые люди утвердят: начните интервью с Intentra или запишите знание вручную.',
    more_one: 'Ещё {{count}} запись — в Знаниях',
    more_few: 'Ещё {{count}} записи — в Знаниях',
    more_many: 'Ещё {{count}} записей — в Знаниях',
    more_other: 'Ещё {{count}} записи — в Знаниях',
    allInKnowledge: 'Все записи — в Знаниях',
    drafts_one: '{{count}} черновик ждёт утверждения',
    drafts_few: '{{count}} черновика ждут утверждения',
    drafts_many: '{{count}} черновиков ждут утверждения',
    drafts_other: '{{count}} черновика ждут утверждения',
    needsReview_one: '{{count}} запись требует проверки',
    needsReview_few: '{{count}} записи требуют проверки',
    needsReview_many: '{{count}} записей требуют проверки',
    needsReview_other: '{{count}} записи требуют проверки',
    startInterview: 'Интервью',
  },
  kindsOne: {
    'product-overview': 'Обзор продукта',
    goal: 'Цель',
    persona: 'Персона',
    feature: 'Фича',
    scenario: 'Сценарий',
    requirement: 'Требование',
    constraint: 'Ограничение',
    term: 'Термин',
    'business-rule': 'Бизнес-правило',
    integration: 'Интеграция',
    decision: 'Решение',
    'open-question': 'Открытый вопрос',
  },
  kindDescriptions: {
    'product-overview':
      'Что это за продукт и для кого. В проекте одно утверждённое описание; меняется только заменой.',
    goal: 'Чего проект хочет достичь и как понять, что достиг.',
    persona:
      'Кто пользуется продуктом или взаимодействует с ним: человек или система.',
    feature:
      'Возможность продукта, какой её видят пользователи. В неё входят сценарии, требования и правила.',
    scenario:
      'Что делает исполнитель и что получает в конце. Исполнитель — персона, связанная через «зависит от».',
    requirement: 'Что система делает или каким качеством обладает.',
    constraint: 'Что навязано проекту извне и не обсуждается.',
    term: 'Слово и что оно значит в этом проекте.',
    'business-rule': 'Правило бизнеса одним предложением.',
    integration:
      'Связь продукта с внешней системой: зачем, куда и чем обмениваемся.',
    decision: 'Что выбрал проект, в какой ситуации и что отверг.',
    'open-question':
      'Что в проекте ещё не решено. Закрывается утверждённым ответом.',
  },
  knowledgeCounts: {
    needs_one: '{{count}} потребность',
    needs_few: '{{count}} потребности',
    needs_many: '{{count}} потребностей',
    needs_other: '{{count}} потребности',
    outOfScope_one: '{{count}} пункт вне рамок',
    outOfScope_few: '{{count}} пункта вне рамок',
    outOfScope_many: '{{count}} пунктов вне рамок',
    outOfScope_other: '{{count}} пункта вне рамок',
    steps_one: '{{count}} шаг',
    steps_few: '{{count}} шага',
    steps_many: '{{count}} шагов',
    steps_other: '{{count}} шага',
    acceptanceCriteria_one: '{{count}} критерий',
    acceptanceCriteria_few: '{{count}} критерия',
    acceptanceCriteria_many: '{{count}} критериев',
    acceptanceCriteria_other: '{{count}} критерия',
    synonymsToAvoid_one: '{{count}} слово избегаем',
    synonymsToAvoid_few: '{{count}} слова избегаем',
    synonymsToAvoid_many: '{{count}} слов избегаем',
    synonymsToAvoid_other: '{{count}} слова избегаем',
    rejectedAlternatives_one: '{{count}} вариант отвергнут',
    rejectedAlternatives_few: '{{count}} варианта отвергнуто',
    rejectedAlternatives_many: '{{count}} вариантов отвергнуто',
    rejectedAlternatives_other: '{{count}} варианта отвергнуто',
  },
  facts: {
    answered: 'Есть ответ',
    open: 'Открыт',
  },
  knowledgeFields: {
    'product-overview': {
      summary: 'Суть продукта',
      problem: 'Какую проблему решает',
      audience: 'Для кого',
      value: 'Что получают пользователи',
    },
    goal: {
      outcome: 'Чего хотим достичь',
      successMetric: 'Как понять, что достигли',
    },
    persona: {
      profile: 'Кто это',
      type: 'Человек или система',
      needs: 'Потребности',
    },
    feature: {
      capability: 'Что умеет',
      outOfScope: 'Чего не делает',
    },
    scenario: {
      expectedResult: 'Ожидаемый результат',
      steps: 'Шаги',
    },
    requirement: {
      statement: 'Формулировка',
      type: 'Тип',
      priority: 'Приоритет',
      acceptanceCriteria: 'Критерии приёмки',
    },
    constraint: {
      constraint: 'Ограничение',
      imposedBy: 'Чем задано',
    },
    term: {
      definition: 'Определение',
      sort: 'Что обозначает',
      synonymsToAvoid: 'Слова, которых избегаем',
    },
    'business-rule': {
      rule: 'Правило',
    },
    integration: {
      purpose: 'Зачем нужна',
      externalSystem: 'Внешняя система',
      direction: 'Направление',
      exchanged: 'Чем обмениваемся',
    },
    decision: {
      decision: 'Что решили',
      area: 'Область',
      context: 'Контекст',
      rejectedAlternatives: 'Отвергнутые варианты',
    },
    'open-question': {
      question: 'Вопрос',
    },
  },
  knowledgeHints: {
    'product-overview': {
      summary: 'Что за продукт и для кого, в нескольких предложениях.',
    },
    goal: {
      outcome: 'Результат, к которому стремится проект.',
    },
    persona: {
      profile: 'Кто пользуется продуктом или взаимодействует с ним.',
      needs: 'По одной потребности в строке.',
    },
    feature: {
      capability: 'Что пользователи могут с ней делать и что получают.',
      outOfScope: 'Что фича намеренно не делает, по одному в строке.',
    },
    scenario: {
      expectedResult: 'Что исполнитель получает в конце.',
      steps:
        'По одному шагу в строке, по порядку. Исполнителя укажите связью «зависит от» с персоной.',
    },
    requirement: {
      statement: 'Что система делает или каким качеством обладает.',
      acceptanceCriteria: 'По одной проверке в строке.',
    },
    constraint: {
      constraint: 'Что навязано проекту извне и не обсуждается.',
    },
    term: {
      definition: 'Что это слово значит в проекте.',
      synonymsToAvoid:
        'Другие слова для того же, которыми проект не пользуется.',
    },
    'business-rule': {
      rule: 'Одним предложением.',
    },
    integration: {
      purpose: 'Для чего продукт связан с другой системой.',
    },
    decision: {
      decision: 'Что выбрал проект.',
      context: 'Ситуация, из-за которой пришлось выбирать.',
    },
    'open-question': {
      question: 'Что о проекте ещё не решено.',
    },
  },
  knowledgeOptions: {
    persona: {
      type: { person: 'Человек', system: 'Система' },
    },
    requirement: {
      type: {
        functional: 'Функциональное',
        'non-functional': 'Нефункциональное',
      },
      priority: {
        must: 'Обязательно',
        should: 'Желательно',
        could: 'Если успеем',
      },
    },
    constraint: {
      imposedBy: {
        law: 'Закон',
        budget: 'Бюджет',
        deadline: 'Срок',
        customer: 'Заказчик',
        company: 'Компания',
        infrastructure: 'Инфраструктура',
      },
    },
    term: {
      sort: {
        entity: 'Сущность',
        value: 'Значение',
        role: 'Роль',
        'action-event': 'Действие или событие',
        other: 'Другое',
      },
    },
    integration: {
      direction: {
        outbound: 'Мы отправляем им',
        inbound: 'Они отправляют нам',
        both: 'В обе стороны',
      },
    },
    decision: {
      area: {
        architecture: 'Архитектура',
        product: 'Продукт',
        business: 'Бизнес',
      },
    },
  },
  linkTypes: {
    'depends-on': 'Зависит от',
    'uses-term': 'Использует термин',
    'justified-by': 'Обосновано решением',
    answers: 'Отвечает на',
    'part-of': 'Входит в фичу',
    concerns: 'Касается',
    'conflicts-with': 'Противоречит',
  },
  incomingLinkTypes: {
    'depends-on': 'Зависят от этой записи',
    'uses-term': 'Используют этот термин',
    'justified-by': 'Обоснованы этим решением',
    answers: 'Отвечают на этот вопрос',
    'part-of': 'Части фичи',
    concerns: 'Открытые вопросы об этой записи',
    'conflicts-with': 'Противоречат этой записи',
  },
  agentContext: {
    open: 'Контекст для агента',
    title: 'Контекст для агента',
    description:
      'Что получит coding-агент, взяв эту запись предметом задачи: утверждённые знания, собранные от неё по связям. Скопируйте текст в любой чат или подключите агента через MCP — он получит то же самое.',
    frame_one: 'Рамка проекта · {{count}} запись',
    frame_few: 'Рамка проекта · {{count}} записи',
    frame_many: 'Рамка проекта · {{count}} записей',
    frame_other: 'Рамка проекта · {{count}} записи',
    frameHint: 'действует на любую задачу',
    withFrame: 'Включить рамку проекта',
    copy: 'Скопировать',
    copied: 'Скопировано',
  },
  knowledge: {
    title: 'Знания',
    description:
      'Всё, что известно о продукте: утверждённые знания и черновики, которые ждут решения человека.',
    views: {
      all: 'Все',
      approved: 'Утверждённые',
      drafts: 'Черновики',
      review: 'На проверке',
      rejected: 'Отклонённые',
      obsolete: 'Устаревшие',
      gaps: 'Пробелы',
    },
    viewsLabel: 'Статус',
    moreViews: 'Ещё',
    signals: {
      gaps_one: '{{count}} пробел',
      gaps_few: '{{count}} пробела',
      gaps_many: '{{count}} пробелов',
      gaps_other: '{{count}} пробела',
      questions_one: '{{count}} открытый вопрос',
      questions_few: '{{count}} открытых вопроса',
      questions_many: '{{count}} открытых вопросов',
      questions_other: '{{count}} открытого вопроса',
    },
    allKinds: 'Все виды',
    kindLabel: 'Вид знаний',
    record: 'Записать',
    recordKind: 'Что записать',
    needsReview: 'на проверке',
    previewMissing: '{{key}} не найдена — возможно, черновик удалили.',
    key: 'Ключ',
    status: 'Статус',
    filters: 'Фильтры',
    replaces: 'Заменяет',
    replacedBy: 'Заменена на',
    empty: {
      all: 'Знаний пока нет. Запишите первое вручную, проведите интервью с Intentra или подключите внешнего агента через MCP.',
      approved:
        'Утверждённых знаний пока нет: черновики ждут решения человека.',
      drafts: 'Черновиков нет: все разобраны.',
      review: 'Перепроверять нечего.',
      rejected: 'Отклонённых записей нет.',
      obsolete: 'Устаревших записей нет.',
      gaps: 'Пробелов не видно: у каждой записи есть то, без чего её трудно понять или проверить.',
    },
    gapRules: {
      'no-product-overview': 'Нет обзора продукта',
      'no-persona': 'Нет ни одной персоны',
      'no-goal': 'Нет ни одной цели',
      'requirement-without-acceptance-criteria':
        'Требования без критериев приёмки',
      'goal-without-success-metric': 'Цели без метрики успеха',
      'decision-without-rejected-alternatives':
        'Решения без отвергнутых альтернатив',
      'scenario-without-persona': 'Сценарии без исполнителя',
      'persona-without-scenario': 'Персоны без сценариев',
      'scenario-without-requirement': 'Сценарии без требований',
      'feature-without-goal': 'Фичи без цели',
      'feature-without-parts': 'Пустые фичи',
      'scenario-without-feature': 'Сценарии вне фич',
      'integration-without-use': 'Интеграции, на которые ничто не опирается',
      unlinked: 'Без связей',
    },
    gapHints: {
      'no-product-overview':
        'Что за продукт и для кого — с этого начинается любой разговор о нём.',
      'no-persona': 'Неизвестно, кто пользуется продуктом.',
      'no-goal': 'Неизвестно, чего проект хочет достичь.',
      'requirement-without-acceptance-criteria':
        'Обязательное требование не говорит, как проверить, что оно выполнено.',
      'goal-without-success-metric':
        'Цель не говорит, как понять, что она достигнута.',
      'decision-without-rejected-alternatives':
        'Решение не называет, из чего выбирали и почему отказались от другого.',
      'scenario-without-persona':
        'Сценарий не связан с персоной, которая его выполняет.',
      'persona-without-scenario':
        'Персона не выполняет ни одного сценария: что она делает в продукте?',
      'scenario-without-requirement':
        'Ни одно требование не говорит, что делает система в этом сценарии.',
      'feature-without-goal':
        'Фича не связана с целью, которой служит: зачем она продукту?',
      'feature-without-parts':
        'В фичу не входит ни один сценарий, требование или правило.',
      'scenario-without-feature':
        'Сценарий не входит ни в одну фичу: к какой возможности продукта он относится? Если к двум — возможно, его стоит разделить.',
      'integration-without-use':
        'Ни одно требование или бизнес-правило не опирается на интеграцию: зачем она?',
      unlinked:
        'Утверждённая запись ни с чем не связана и не входит в рамку проекта. Агент получит её, только если выберет её саму: свяжите её с тем, к чему она относится.',
    },
    gapOfProject: 'В проекте пока нет ни одной записи этого вида',
    emptyKind: 'Записей этого вида здесь нет.',
    approveAll: {
      open: 'Утвердить все',
      title: 'Утвердить черновики',
      titleCount_one: 'Утвердить {{count}} черновик',
      titleCount_few: 'Утвердить {{count}} черновика',
      titleCount_many: 'Утвердить {{count}} черновиков',
      titleCount_other: 'Утвердить {{count}} черновика',
      description: 'Одним шагом и вместе с зависимостями — все или ни один.',
      firstOnly:
        'Здесь первые {{count}} черновиков, остальные — следующим заходом.',
      dependency: 'зависимость',
      dependencyHint:
        'Не входит в выбранное, но выбранные черновики от него зависят',
      blocked: 'Не будут утверждены',
      reasons: {
        forbidden: 'Утверждать его вам нельзя',
        'needs-review': 'На проверке',
        'depends-on-blocked': 'Зависит от',
      },
      nothing: 'Утверждать нечего.',
      confirm_one: 'Утвердить {{count}}',
      confirm_few: 'Утвердить {{count}}',
      confirm_many: 'Утвердить {{count}}',
      confirm_other: 'Утвердить {{count}}',
    },
    orderLabel: 'Порядок',
    agentTags: {
      'intentra-agent': 'Intentra',
      'external-agent': 'MCP',
      'analysis-run': 'Audit',
    },
    agentHints: {
      'intentra-agent': 'Записала Intentra в интервью от имени {{who}}.',
      'external-agent':
        'Записал внешний агент (Claude Code, Codex, Cursor…) через MCP от имени {{who}}, по его токену доступа.',
      'analysis-run': 'Нашла {{who}} при проверке проекта.',
    },
    orders: {
      'by-key': 'По ключу',
      'newest-first': 'Сначала новые',
    },
    more_one: 'Ещё {{count}}',
    more_few: 'Ещё {{count}}',
    more_many: 'Ещё {{count}}',
    more_other: 'Ещё {{count}}',
  },
  featureParts: {
    title: 'Части фичи',
    empty:
      'В фичу пока ничего не входит. Добавьте сценарии, требования и правила, которые описывают эту возможность, — агент получит их вместе с фичей.',
    add: 'Добавить',
    addCount_one: 'Добавить {{count}}',
    addCount_few: 'Добавить {{count}}',
    addCount_many: 'Добавить {{count}}',
    addCount_other: 'Добавить {{count}}',
    search: 'Ключ или название',
    nothingFound: 'Ничего не нашлось.',
    from: 'сейчас в {{key}}, переедет сюда',
    moving_one: '{{count}} запись переедет из другой фичи',
    moving_few: '{{count}} записи переедут из других фич',
    moving_many: '{{count}} записей переедут из других фич',
    moving_other: '{{count}} записи переедут из других фич',
    remove: 'Убрать {{key}} из фичи',
    blocks: {
      featureNotApproved:
        'утверждённую запись можно добавить после утверждения фичи',
    },
  },
  knowledgeItem: {
    back: 'Знания',
    missing: 'Такой записи нет',
    missingHint: 'Возможно, черновик удалили. Вернитесь к списку знаний.',
    content: 'Содержание',
    notFilled: 'не заполнено',
    rationale: 'Обоснование',
    noRationale: 'Обоснование не записано.',
    links: 'Связи',
    noLinks: 'Связей нет.',
    noLinksHint:
      'Связей пока нет. Свяжите запись с персонами, терминами, решениями и требованиями, на которые она опирается, — так её смысл понятен без пересказа.',
    notInIndex: 'не найдена: удалена или за пределами первых 200 записей.',
    seeAbove: '(см. выше)',
    replaces: 'Заменяет',
    replacedBy: 'Заменена на',
    approvesTogether: 'утвердится вместе',
    approvalBlocks: {
      forbidden: 'вам не утвердить',
      'needs-review': 'на проверке',
      rejected: 'отклонено',
      obsolete: 'устарело',
    },
    properties: 'Свойства',
    key: 'Ключ',
    kind: 'Вид',
    status: 'Статус',
    version: 'Версия',
    versionValue: 'v{{version}}',
    source: 'Источник',
    history: 'История',
    events: {
      recorded: 'Записано',
      edited: 'Изменено',
      approved: 'Утверждено',
      rejected: 'Отклонено',
      superseded: 'Заменено',
      retired: 'Выведено из обращения',
      featureAssigned: 'Изменена фича',
    },
    approve: 'Утвердить',
    approveWith_one: 'Утвердить вместе с {{count}} черновиком',
    approveWith_few: 'Утвердить вместе с {{count}} черновиками',
    approveWith_many: 'Утвердить вместе с {{count}} черновиками',
    approveWith_other: 'Утвердить вместе с {{count}} черновика',
    approveBlockedTitle: 'Утвердить пока нельзя',
    approveBlockedBy: {
      obsolete:
        '<key/> устарела — свяжите запись с актуальной заменой или уберите связь.',
      rejected: '<key/> отклонена — уберите связь или свяжите запись с другой.',
      'needs-review': '<key/> сама ждёт проверки — начните с неё.',
      forbidden:
        'Черновик <key/> может утвердить только участник с ролью «Утверждает».',
    },
    edit: 'Править',
    reject: 'Отклонить',
    rejectTitle: 'Отклонить <mono>{{key}}</mono>?',
    rejectDescription:
      'Черновик останется в журнале как отклонённый. Причина поможет автору и агентам не предлагать его снова.',
    reason: 'Причина',
    reasonHint: 'Необязательно.',
    delete: 'Удалить черновик',
    deleteTitle: 'Удалить <mono>{{key}}</mono>?',
    deleteDescription:
      'Черновик исчезнет без следа. Если он записан по ошибке — удаляйте; если он неверен по сути — лучше отклонить.',
    deleteConfirm: 'Удалить',
    recordReplacement: 'Записать замену',
    retire: 'Вывести из обращения',
    retireTitle: 'Вывести <mono>{{key}}</mono> из обращения?',
    retireDescription:
      'Запись станет устаревшей, и замены у неё не будет. Записи, которые от неё зависят, попадут на проверку.',
    retireConfirm: 'Вывести',
    confirm: 'Всё ещё верно',
    needsReviewTitle: 'Требует проверки',
    gapsTitle: 'Чего не хватает',
    discussGaps: 'Обсудить с Intentra',
    questionOpenTitle: 'Вопрос ждёт ответа',
    answerProposedTitle_one: 'Предложен ответ',
    answerProposedTitle_few: 'Предложены ответы',
    answerProposedTitle_many: 'Предложены ответы',
    answerProposedTitle_other: 'Предложены ответы',
    answerProposedHint_one:
      'Утвердите его — и вопрос закроется вместе с ним. Не согласны — отклоните или обсудите с Intentra.',
    answerProposedHint_few:
      'Утвердите подходящий — и вопрос закроется вместе с ним. Не согласны — отклоните или обсудите с Intentra.',
    answerProposedHint_many:
      'Утвердите подходящий — и вопрос закроется вместе с ним. Не согласны — отклоните или обсудите с Intentra.',
    answerProposedHint_other:
      'Утвердите подходящий — и вопрос закроется вместе с ним. Не согласны — отклоните или обсудите с Intentra.',
    showAnswer: 'Показать ответ ниже',
    discussAnswerPrompt:
      'Давай разберём ответ на открытый вопрос {{key}} «{{title}}»: {{question}} Предложено: {{answers}}. Сверь это с утверждёнными знаниями, назови риски и альтернативы, задавай мне вопросы по одному. Если ответ нужно поправить — запиши исправленный черновиком.',
    questionOpen:
      'Обсудите его с Intentra: ответ станет записью, которая закроет вопрос.',
    discussQuestionPrompt:
      'Давай разберём открытый вопрос {{key}} «{{title}}»: {{question}} Помоги найти ответ: задавай мне вопросы по одному, предлагай варианты, а когда решим — запиши ответ черновиком, который закроет этот вопрос.',
    discussGapsPrompt:
      'Давай обсудим {{key}} «{{title}}». Чего не хватает: {{gaps}} Разберись, как это закрыть, и предложи варианты; задавай мне вопросы по одному, а когда решим — запиши.',
    reviewCause: {
      superseded:
        'Запись опирается на <key/>, которую заменили на <next/>. Если запись верна и с <next/>, подтвердите — связь переключится сама.',
      retired:
        'Запись опирается на <key/>, которую вывели из обращения. Если запись верна и без <key/>, подтвердите — связь уберётся.',
      rejected:
        'Запись опирается на <key/>, которую отклонили. Если запись верна и без <key/>, подтвердите — связь уберётся.',
      changed: 'Изменилась <key/>, на которую опирается запись.',
    },
    reviewOtherwiseDraft: 'Если нет — исправьте запись.',
    reviewOtherwiseApproved: 'Если нет — запишите ей замену.',
    dependencyNeedsReview:
      'Что-то дальше по цепочке зависимостей ждёт проверки.',
    supersedes: 'После утверждения заменит <key/>.',
    supersededBy: 'Заменена записью <key/>.',
    rejectedBecause: 'Отклонена. Причина: {{reason}}',
    rejectedNoReason: 'Отклонена без указания причины.',
    retiredBecause: 'Выведена из обращения. Причина: {{reason}}',
    retiredNoReason: 'Выведена из обращения без указания причины.',
    answeredBy: 'Ответ записан в <keys/>.',
    stillOpen: 'Вопрос открыт: утверждённого ответа пока нет.',
    by: '{{who}}, <mono>{{date}}</mono>',
  },
  knowledgeEditor: {
    titleNew: 'Новый черновик',
    titleEdit: 'Правка <mono>{{key}}</mono>',
    titleReplacement: 'Замена <mono>{{key}}</mono>',
    descriptionNew:
      'Вид: {{kind}}. Черновик станет знанием только после утверждения.',
    descriptionEdit:
      'Вид: {{kind}}. Править можно, пока черновик не утверждён.',
    descriptionReplacement:
      'Вид: {{kind}}. Когда черновик утвердят, он заменит {{key}}, а {{key}} устареет.',
    about: 'Запись',
    content: 'Содержание',
    title: 'Заголовок',
    titleHint: 'Коротко, чтобы узнать запись в списке.',
    rationale: 'Обоснование',
    rationaleHint:
      'Откуда это известно: встреча, документ, чьё-то решение. Необязательно.',
    links: 'Связи',
    linksHint:
      'На какие записи опирается эта. Утвердить её можно, только когда утверждено всё, от чего она зависит.',
    addLink: 'Добавить связь',
    linkType: 'Тип связи',
    linkTarget: 'Запись',
    chooseTarget: 'Выберите запись',
    removeLink: 'Убрать связь',
    noTargets: 'Других записей пока нет.',
    addEntry: 'Добавить строку',
    removeEntry: 'Убрать строку',
    alternative: 'Вариант',
    alternativeReason: 'Почему отвергнут',
    addAlternative: 'Добавить вариант',
    removeAlternative: 'Убрать вариант',
    none: 'Не указано',
    submitNew: 'Записать черновик',
    submitEdit: 'Сохранить',
    notDraft:
      'Это уже не черновик: утверждённую запись не правят. Чтобы изменить её, запишите замену.',
    cannotEdit:
      'Править черновики в этом проекте вам нельзя: нужен доступ «пишет» или «утверждает».',
    notRecordable: 'Записывать знания этого вида вам нельзя.',
    unknownKind: 'Выберите, что записать, на странице знаний.',
    changed:
      'Пока вы правили, черновик изменил кто-то ещё. Скопируйте свои правки, откройте черновик заново и повторите.',
    missingSuperseded: 'Заменяемая запись не найдена.',
  },
  providerKey: {
    title: 'Ключ OpenRouter',
    description: 'На нём работают агенты пространства.',
    key: 'Ключ',
    keyHint:
      'Создаётся на openrouter.ai/keys. Хранится зашифрованным и больше не показывается.',
    checking: 'Проверяю в OpenRouter',
    none: 'Ключа нет, агенты не работают. Добавить его может владелец.',
    added: '{{who}}, {{date}}',
    formerMember: 'бывший участник',
    replace: 'Заменить',
    remove: 'Удалить ключ',
    removeTitle: 'Удалить ключ OpenRouter?',
    removeDescription:
      'Агенты пространства перестанут отвечать, пока не добавят новый ключ.',
  },
  unsavedChanges: {
    title: 'Уйти без сохранения?',
    description: 'Введённое на этой странице пропадёт.',
    leave: 'Уйти',
    stay: 'Остаться',
  },
  platformSettings: {
    title: 'Настройки платформы',
    description: 'Кто может прийти в Intentra и начать в ней работу.',
    access: 'Доступ',
    signUp: 'Открытая регистрация',
    signUpOn: 'Зарегистрироваться может любой.',
    signUpOff:
      'Зарегистрироваться может только тот, чей email пригласили в пространство.',
    workspaceCreation: 'Создание пространств',
    workspaceCreationOn: 'Создать своё пространство может любой участник.',
    workspaceCreationOff:
      'Создавать пространства может только администратор платформы. Остальные приходят в пространства по приглашению.',
  },
  platform: {
    title: 'Платформа',
    pages: {
      agents: 'Агенты',
      skills: 'Skills',
      modelProfiles: 'Модели',
      changes: 'Изменения',
      settings: 'Настройки',
    },
    forbidden: 'Раздел администратора платформы',
    forbiddenHint:
      'Здесь настраивают агентов Intentra. Это может только администратор платформы.',
    roles: {
      intentra: 'Intentra',
      auditor: 'Auditor',
      specialist: 'Specialist',
    },
    changeKinds: {
      added: 'Новый',
      changed: 'Изменён',
      removed: 'Удалён',
    },
    status: 'Публикация',
    unchanged: 'Как в опубликованной версии',
    writes: 'пишет',
    usedBy_one: 'у {{count}} агента',
    usedBy_few: 'у {{count}} агентов',
    usedBy_many: 'у {{count}} агентов',
    usedBy_other: 'у {{count}} агента',
    unused: 'не используется',
    tools_one: '<mono>{{count}}</mono> инструмент',
    tools_few: '<mono>{{count}}</mono> инструмента',
    tools_many: '<mono>{{count}}</mono> инструментов',
    tools_other: '<mono>{{count}}</mono> инструмента',
  },
  platformAgents: {
    descriptionPublished:
      'Правки здесь не меняют того, с чем работают пространства, пока вы их не опубликуете. Сейчас опубликована версия {{number}}.',
    descriptionNothing:
      'Пространства не могут разговаривать с агентами, пока вы не опубликуете первую версию.',
    createIntentra: 'Создать Intentra',
    createAuditor: 'Создать Auditor',
    createSpecialist: 'Новый Specialist',
    emptyNoModels:
      'Агентов пока нет. Сначала добавьте модель: каждый агент работает на одной из них.',
    toModels: 'К моделям',
    empty:
      'Агентов пока нет. Начните с Intentra: с ней разговаривают люди в пространствах.',
  },
  platformAgent: {
    back: 'Агенты',
    titleNew: 'Новый {{role}}',
    about: {
      intentra:
        'С ней разговаривают люди в пространствах. Она зовёт Specialists, когда нужна их работа.',
      auditor:
        'Проверяет знания проекта без разговора: ищет противоречия и неясности и записывает их открытыми вопросами от имени Intentra.',
      specialist:
        'Intentra зовёт его, когда по описанию видит, что задача для него.',
    },
    name: 'Имя',
    description: 'Описание',
    descriptionHints: {
      intentra: 'Коротко, что делает агент.',
      auditor: 'Коротко, что делает агент.',
      specialist:
        'Intentra читает это, решая, звать ли агента. Напишите, за что он берётся и что возвращает.',
    },
    instructions: 'Инструкции',
    instructionsHint:
      'Как агент работает. Проект и правила роли участника в проекте код добавит сам.',
    modelProfile: 'Модель',
    chooseModelProfile: 'Выберите модель',
    noModelProfiles: 'Моделей пока нет.',
    tools: 'Инструменты',
    toolsHint: 'Со зрителем проекта агент получит только читающие.',
    toolsSearch: 'Найти инструмент',
    toolsEmpty: 'Такого инструмента нет',
    toolsNone: 'Без инструментов',
    toolMissing: 'нет в коде',
    readGroup: 'Читают',
    writeGroup: 'Пишут',
    chosenGroup: '{{group}} · <mono>{{count}}</mono>',
    skills: 'Skills',
    skillsSearch: 'Найти Skill',
    skillsEmpty: 'Такого Skill нет',
    skillsNone: 'Без Skills',
    specialists: 'Specialists',
    specialistsHint: 'Кого Intentra может позвать.',
    specialistsSearch: 'Найти агента',
    specialistsEmpty: 'Specialists пока нет',
    specialistsNone: 'Никого',
    choose: 'Выбрать',
    create: 'Создать',
    delete: 'Удалить агента',
    deleteTitle: 'Удалить {{name}}?',
    deleteDescription:
      'Агент уйдёт из неопубликованных, и Intentra перестанет его звать. Пространства потеряют его со следующей публикацией.',
    missing: 'Такого агента нет',
    missingHint: 'Возможно, его удалили. Откройте агента из списка.',
    exists: {
      intentra: 'Intentra уже есть, второй не нужно. Откройте её из списка.',
      auditor: 'Auditor уже есть, второй не нужен. Откройте его из списка.',
    },
    unknownRole: 'Выберите, кого создать, на странице агентов.',
  },
  platformSkills: {
    description:
      'Инструкции, которые агент читает, только когда задача их требует. Описание он видит всегда.',
    create: 'Новый Skill',
    empty: 'Skills пока нет.',
  },
  platformSkill: {
    back: 'Skills',
    titleNew: 'Новый Skill',
    about:
      'Агент видит описание всегда, а инструкции читает, когда берётся за такую задачу.',
    name: 'Имя',
    nameHint:
      'Начинается с intentra-, дальше латиница, цифры и дефисы. Его видят агенты.',
    nameFormat:
      'Нужно intentra- и после него строчная латиница, цифры или дефисы',
    description: 'Описание',
    descriptionHint:
      'Когда пользоваться: по этому агент решает, читать ли инструкции.',
    instructions: 'Инструкции',
    usedBy: 'Используют',
    usedByNone: 'Пока ни один агент.',
    delete: 'Удалить Skill',
    deleteTitle: 'Удалить {{name}}?',
    deleteDescriptionUnused: 'Skill уйдёт из неопубликованных.',
    deleteDescriptionUsed:
      'Skill уйдёт из неопубликованных и у агентов: {{agents}}.',
    missing: 'Такого Skill нет',
    missingHint: 'Возможно, его удалили. Откройте Skill из списка.',
  },
  platformModels: {
    description: 'Профили, на которых работают агенты.',
    create: 'Новая модель',
    empty: 'Профилей пока нет. Выберите модель в каталоге.',
    notInCatalog: 'Модели нет в каталоге',
    catalog: {
      title: 'Каталог OpenRouter',
      refresh: 'Обновить список и замеры',
      model: 'Модель',
      inputPrice: '$ вход',
      outputPrice: '$ выход',
      contextLength: 'Контекст',
      throughput: 'Скорость',
      latency: 'Задержка',
      profiles: 'Профили: {{names}}',
      priceFilter: 'Цена',
      prices: {
        all: 'Все',
        free: 'Бесплатные',
        paid: 'Платные',
      },
      speedFilter: 'Скорость',
      anySpeed: 'Любая скорость',
      fromSpeed: 'От {{value}} ток/с',
      speed: '{{value}} ток/с',
      latencyFilter: 'Задержка',
      anyLatency: 'Любая задержка',
      upToLatency: 'До {{value}} с',
      latencyValue: '{{value}} с',
      keyPlaceholder: 'Ключ OpenRouter',
      noKey: 'скорость и задержка — с ключом, он остаётся в этой вкладке',
      keyRejected: 'ключ не принят',
      measuring_one: 'замер: осталась {{count}}',
      measuring_few: 'замер: осталось {{count}}',
      measuring_many: 'замер: осталось {{count}}',
      measuring_other: 'замер: осталось {{count}}',
      measured: 'медианы за 30 минут',
      footer_one: '{{count}} модель · $ за 1M токенов',
      footer_few: '{{count}} модели · $ за 1M токенов',
      footer_many: '{{count}} моделей · $ за 1M токенов',
      footer_other: '{{count}} модели · $ за 1M токенов',
    },
    editTitle: 'Модель {{name}}',
    createTitle: 'Новая модель',
    dialogDescription: 'Пустые настройки берутся у модели по умолчанию.',
    name: 'Название',
    modelId: 'Модель OpenRouter',
    temperature: 'Temperature',
    temperatureHint: 'От 0 до 2.',
    reasoningEffort: 'Рассуждение',
    maxOutputTokens: 'Длина ответа',
    maxOutputTokensHint: 'Больше всего токенов в одном ответе.',
    byDefault: 'По умолчанию',
    reasoning: {
      low: 'Короткое',
      medium: 'Обычное',
      high: 'Долгое',
    },
    factTemperature: 'Temperature {{value}}',
    factReasoning: 'рассуждение {{value}}',
    factMaxTokens: 'до {{value}} токенов',
    deleteTitle: 'Удалить {{name}}?',
    deleteDescriptionUnused: 'Модель уйдёт из неопубликованных.',
    deleteDescriptionUsed:
      'На ней работают: {{agents}}. Сначала переведите их на другую модель.',
    invalidNumber: 'Введите число',
    temperatureRange: 'От 0 до 2',
    tokensRange: 'Целое число от 1 до 1 000 000',
    picker: {
      choose: 'Выберите модель',
      search: 'Найти модель: claude, gpt, gemini…',
      loading: 'Загружаю модели OpenRouter…',
      failed: 'Не удалось получить список моделей OpenRouter.',
      empty: 'Ничего не нашлось',
      footer_one: '{{count}} модель · цена за 1M токенов: вход / выход',
      footer_few: '{{count}} модели · цена за 1M токенов: вход / выход',
      footer_many: '{{count}} моделей · цена за 1M токенов: вход / выход',
      footer_other: '{{count}} модели · цена за 1M токенов: вход / выход',
      required: 'Выберите модель',
      unknown:
        'Этой модели нет среди тех, на которых работают агенты: она не вызывает инструменты или OpenRouter её убрал. Выберите другую.',
      noTemperature: 'Эта модель не принимает temperature.',
      noReasoning: 'Эта модель не рассуждает.',
      maxTokens: 'У этой модели — до {{value}}.',
    },
  },
  platformChanges: {
    descriptionPublished:
      'Чем неопубликованные агенты отличаются от версии {{number}}, с которой работают пространства.',
    descriptionNothing:
      'Ничего ещё не опубликовано: первая публикация станет версией 1.',
    problems: 'Мешает публикации',
    problemsHint: 'Пока это не исправлено, опубликовать нельзя.',
    open: 'Открыть',
    agents: 'Агенты',
    skills: 'Skills',
    modelProfiles: 'Модели',
    changedFields: 'Изменено: {{fields}}',
    none: 'Неопубликованных изменений нет: пространства работают на том же, что вы видите.',
    noneNothing:
      'Публиковать пока нечего. Добавьте модель, Intentra и Auditor: с ними можно выпустить версию 1.',
    publish: 'Публикация',
    publishHint:
      'Пространства перейдут на версию {{number}} со следующего сообщения в разговоре.',
    note: 'Заметка',
    noteHint: 'Зачем эта версия, в паре слов. Необязательно.',
    submit: 'Опубликовать версию {{number}}',
    blocked: 'Сначала исправьте то, что мешает публикации.',
    published: 'Версия {{number}} опубликована.',
    problemTexts: {
      'intentra-count': 'Intentra должна быть ровно одна.',
      'auditor-count': 'Нужен ровно один Auditor.',
      'duplicate-skill-name': 'Несколько Skills называются {{name}}.',
      'tool-unavailable':
        '{{name}} использует инструмент {{tool}}, которого больше нет в коде.',
      'skill-missing': '{{name}} использует Skill, которого нет.',
      'model-profile-missing': '{{name}} работает на модели, которой нет.',
      'specialist-calls-agents':
        '{{name}} — Specialist и не может звать других агентов.',
      'calls-non-specialist': '{{name}} зовёт агента, который не Specialist.',
    },
    fields: {
      name: 'имя',
      description: 'описание',
      instructions: 'инструкции',
      tools: 'инструменты',
      skillIds: 'Skills',
      modelProfileId: 'модель',
      specialistIds: 'Specialists',
      modelId: 'модель OpenRouter',
      temperature: 'temperature',
      reasoningEffort: 'рассуждение',
      maxOutputTokens: 'длина ответа',
    },
  },
  interview: {
    title: 'Интервью',
    conversations: 'Разговоры',
    new: 'Новый разговор',
    untitled: 'Без названия',
    noConversations: 'Разговоров пока нет.',
    showHidden: 'Скрытые',
    showShown: 'Все разговоры',
    noHidden: 'Скрытых нет.',
    actions: 'Действия с разговором',
    rename: 'Переименовать',
    hide: 'Скрыть',
    unhide: 'Вернуть',
    delete: 'Удалить',
    deleteTitle: 'Удалить разговор?',
    deleteDescription:
      'Сообщения пропадут. Черновики, которые записала Intentra, останутся.',
    renameLabel: 'Название разговора',
    emptyDescription:
      'Агент видит, что уже известно о проекте, расспросит о том, чего не хватает, и запишет черновики знаний.',
    known: 'Что уже известно',
    knownLabel: '{{kind}}: утверждено {{approved}}, черновиков {{drafts}}',
    beginWith: 'С чего начать',
    starters: {
      fresh: 'Проект пока пуст: расскажу о продукте с нуля',
      needsReview_one: '{{count}} запись требует проверки',
      needsReview_few: '{{count}} записи требуют проверки',
      needsReview_many: '{{count}} записей требуют проверки',
      needsReview_other: '{{count}} записи требуют проверки',
      drafts_one: '{{count}} черновик ждёт утверждения',
      drafts_few: '{{count}} черновика ждут утверждения',
      drafts_many: '{{count}} черновиков ждут утверждения',
      drafts_other: '{{count}} черновика ждут утверждения',
      openQuestions_one: '{{count}} открытый вопрос без ответа',
      openQuestions_few: '{{count}} открытых вопроса без ответа',
      openQuestions_many: '{{count}} открытых вопросов без ответа',
      openQuestions_other: '{{count}} открытого вопроса без ответа',
      empty: '{{kind}} — пока пусто',
      gaps: 'Чего не хватает в знаниях проекта?',
      gapsFound_one: '{{count}} пробел в знаниях',
      gapsFound_few: '{{count}} пробела в знаниях',
      gapsFound_many: '{{count}} пробелов в знаниях',
      gapsFound_other: '{{count}} пробела в знаниях',
    },
    starterActions: {
      fresh: 'Начать',
      needsReview: 'Проверить',
      drafts: 'Разобрать',
      openQuestions: 'Обсудить',
      empty: 'Заполнить',
      gaps: 'Спросить',
    },
    openings: {
      fresh:
        'Расскажу о продукте с нуля. Задавай мне вопросы по одному, предлагай варианты ответа и записывай то, что выясним, черновиками.',
      needsReview:
        'Давай разберём записи, которые требуют проверки: что в них устарело после изменений и что нужно поправить. Иди по одной.',
      drafts:
        'Давай разберём черновики, которые ждут утверждения: что в них неточно, что противоречит друг другу и что стоит дополнить. Иди по одному.',
      openQuestions:
        'Давай обсудим открытые вопросы проекта и попробуем на них ответить. Иди по одному и записывай то, что решим, черновиками.',
      gaps: 'Чего не хватает в знаниях проекта? Посмотри, что уже записано, найди пробелы и противоречия и задавай мне вопросы по одному.',
      gapsFound:
        'Давай закроем пробелы в знаниях проекта. Начни с самого важного, задавай мне вопросы по одному и записывай то, что выясним, черновиками.',
      fill: 'Давай заполним «{{kind}}»: {{about}} Сейчас здесь пусто. Задавай мне вопросы по одному, предлагай варианты ответа и записывай то, что выясним, черновиками.',
      add: 'Давай дополним «{{kind}}»: {{about}} Уже записано: {{count}}. Посмотри, чего не хватает и что противоречит друг другу, задавай мне вопросы по одному и записывай новое черновиками.',
    },
    placeholder: 'Сообщение Intentra',
    send: 'Отправить',
    stop: 'Остановить',
    composerHint: 'Enter — отправить, Shift+Enter — новая строка',
    viewer:
      'У вас доступ на чтение: Intentra ответит, но черновиков не запишет.',
    unpublished: 'Неопубликованные агенты',
    unpublishedHint:
      'Ваши разговоры идут на неопубликованных агентах из админки.',
    you: 'Вы',
    agent: 'Агент',
    activities: {
      thinking: 'Думает',
      reasoning: 'Размышляет',
      reading: 'Читает знания',
      writing: 'Записывает',
      specialist: 'Спрашивает {{name}}',
      answering: 'Отвечает',
    },
    workLog_one: 'Ход работы · {{count}} шаг',
    workLog_few: 'Ход работы · {{count}} шага',
    workLog_many: 'Ход работы · {{count}} шагов',
    workLog_other: 'Ход работы · {{count}} шага',
    stepReasoning: 'Размышление',
    steps: {
      thinking: 'Шаг',
      reasoning: 'Размышление',
      reading: 'Прочитала знания',
      writing: 'Записала',
      specialist: 'Спросила {{name}}',
      answering: 'Ответ',
    },
    stepFailed: 'не удалось',
    writes: {
      record: 'Записан черновик',
      edit: 'Исправлен черновик',
      confirm: 'Подтверждено',
      delete: 'Удалён черновик',
    },
    writeFailed: 'Не удалось записать',
    choicesMultiple: 'Можно выбрать несколько',
    choicesSingle: 'Ответ уходит сразу',
    choicesOther: 'Свой ответ',
    choicesSubmit: 'Ответить',
    choicesSubmitCount_one: 'Ответить · {{count}}',
    choicesSubmitCount_few: 'Ответить · {{count}}',
    choicesSubmitCount_many: 'Ответить · {{count}}',
    choicesSubmitCount_other: 'Ответить · {{count}}',
    choicesPicked: 'выбрано',
    choicesOwnAnswer: 'свой ответ',
    captured: 'Записано в разговоре',
    capturedEmpty: 'Пока ничего.',
    capturedMissing: 'Удалён',
    failed: 'Intentra не ответила',
    retry: 'Повторить',
    busy: 'Intentra ещё отвечает в этом разговоре. Подождите и повторите.',
    missing: 'Такого разговора нет',
    missingHint: 'Возможно, его удалили. Выберите другой или начните новый.',
  },
  errors: {
    fallback: 'Что-то пошло не так. Попробуйте ещё раз',
    INVALID_CREDENTIALS: 'Неверный email или пароль',
    ACCOUNT_ALREADY_EXISTS: 'Аккаунт с этим email уже есть',
    ACCOUNT_BLOCKED: 'Аккаунт заблокирован',
    SIGN_UP_CLOSED:
      'Регистрация пока только по приглашению: попросите владельца пространства пригласить этот email',
    INVALID_PERSON_NAME: 'Введите имя до 100 символов',
    VALIDATION_FAILED: 'Проверьте введённые данные',
    UNAUTHENTICATED: 'Войдите снова',
    INTERNAL: 'На сервере что-то сломалось. Попробуйте позже',
    NETWORK_ERROR: 'Нет связи с сервером. Проверьте подключение',
    INVALID_WORKSPACE_NAME: 'Введите название до 100 символов',
    INVALID_WORKSPACE_SLUG:
      'От 3 до 15 символов: латиница, цифры и дефисы между ними',
    WORKSPACE_SLUG_TAKEN: 'Этот адрес уже занят',
    WORKSPACE_SLUG_MISMATCH: 'Адрес не совпадает',
    WORKSPACE_NOT_FOUND: 'Пространство не найдено',
    INVALID_PROJECT_NAME: 'Введите название до 100 символов',
    INVALID_PROJECT_SLUG:
      'От 3 до 15 символов: латиница, цифры и дефисы между ними',
    PROJECT_SLUG_TAKEN: 'В этом пространстве такой адрес уже есть',
    PROJECT_SLUG_MISMATCH: 'Адрес не совпадает',
    PROJECT_NOT_FOUND: 'Проект не найден',
    PROJECT_CREATION_FORBIDDEN: 'Создавать проекты может владелец или менеджер',
    PROJECT_DELETION_FORBIDDEN:
      'Удалить этот проект может владелец или менеджер, который его создал',
    PROJECT_ROLE_CHANGE_FORBIDDEN:
      'Менять доступ может владелец или тот, кто утверждает в проекте',
    OWNER_PROJECT_ROLE_FIXED:
      'Владелец пространства всегда утверждает во всех проектах',
    NOT_WORKSPACE_OWNER: 'Это может только владелец пространства',
    LAST_OWNER_CANNOT_LEAVE:
      'Вы последний владелец. Сначала сделайте владельцем кого-то ещё',
    LAST_OWNER_CANNOT_STEP_DOWN:
      'Это последний владелец. Сначала сделайте владельцем кого-то ещё',
    MEMBER_NOT_FOUND: 'Участник не найден',
    MEMBER_NOT_ACTIVE: 'Этот человек больше не участник пространства',
    INVITATION_ALREADY_PENDING: 'Этот email уже приглашён',
    ALREADY_WORKSPACE_MEMBER: 'Этот человек уже в пространстве',
    INVITATION_EXPIRED: 'Срок приглашения истёк',
    INVITATION_NOT_PENDING: 'На это приглашение уже ответили',
    INVITATION_NOT_FOUND: 'Приглашение не найдено',
    INVALID_OAUTH_REQUEST:
      'Агент прислал неверную ссылку. Начните подключение в нём заново.',
    INVALID_PERSONAL_ACCESS_TOKEN_NAME: 'Введите название токена',
    INVALID_PERSONAL_ACCESS_TOKEN_LIFETIME: 'Выберите срок действия',
    PERSONAL_ACCESS_TOKEN_NOT_FOUND: 'Токен не найден',
    KNOWLEDGE_ITEM_NOT_FOUND: 'Такой записи нет',
    KNOWLEDGE_ITEM_CHANGED:
      'Запись изменилась, пока вы её читали. Мы показали новую версию — проверьте её и повторите',
    KNOWLEDGE_ITEM_NOT_DRAFT:
      'Это уже не черновик: его утвердили или отклонили',
    KNOWLEDGE_ITEM_NOT_APPROVED: 'Запись больше не утверждена',
    KNOWLEDGE_ITEM_NOT_MARKED: 'Запись уже не требует проверки',
    KNOWLEDGE_ITEM_NEEDS_REVIEW:
      'Сначала проверьте запись: изменилось то, на чём она держится',
    KNOWLEDGE_ITEM_LINKED:
      'На этот черновик ссылаются другие записи. Сначала уберите эти связи',
    KNOWLEDGE_KIND_MISMATCH: 'Вид черновика менять нельзя',
    KNOWLEDGE_RECORDING_FORBIDDEN: 'Записывать знания этого вида вам нельзя',
    KNOWLEDGE_RETIREMENT_FORBIDDEN:
      'Выводить из обращения может только тот, кто утверждает в проекте',
    KNOWLEDGE_CONFIRMATION_FORBIDDEN:
      'Подтвердить эту запись может только тот, кто утверждает в проекте',
    DRAFT_APPROVAL_FORBIDDEN:
      'Утверждать может только тот, кто утверждает в проекте',
    DRAFT_REJECTION_FORBIDDEN:
      'Отклонять может только тот, кто утверждает в проекте',
    DRAFT_EDITING_FORBIDDEN: 'Править черновики вам нельзя',
    DRAFT_DELETION_FORBIDDEN: 'Удалять черновики вам нельзя',
    ANCHOR_NOT_APPROVED:
      'Контекст для агента собирается только от утверждённых записей',
    DEPENDENCIES_NOT_APPROVED:
      'Не всё, от чего зависит запись, утверждено. Утвердите их вместе',
    ANSWERED_QUESTIONS_NOT_APPROVED:
      'Вопрос, на который отвечает запись, ещё черновик. Утвердите их вместе',
    SUPERSEDED_ITEM_NOT_APPROVED:
      'Заменяемая запись уже не утверждена: её заменили или вывели из обращения',
    PRODUCT_OVERVIEW_ALREADY_APPROVED:
      'Обзор продукта уже утверждён. Запишите новый как его замену',
    INVALID_KNOWLEDGE_TITLE: 'Введите заголовок до 200 символов',
    INVALID_KNOWLEDGE_FIELDS: 'Проверьте поля записи',
    INVALID_RATIONALE: 'Обоснование — не больше 2000 символов',
    RATIONALE_REQUIRED: 'Запишите обоснование',
    INVALID_REJECTION_REASON: 'Причина — не больше 2000 символов',
    INVALID_RETIREMENT_REASON: 'Причина — не больше 2000 символов',
    INVALID_LINK: 'Проверьте связи',
    LINK_TARGET_NOT_FOUND: 'Запись, на которую ведёт связь, не найдена',
    LINK_TARGET_NOT_CURRENT:
      'Связь ведёт на отклонённую или устаревшую запись. Выберите актуальную',
    INVALID_PROVIDER_KEY: 'Это не похоже на ключ OpenRouter',
    PROVIDER_KEY_REJECTED: 'OpenRouter не принял ключ',
    PROVIDER_UNAVAILABLE: 'OpenRouter не ответил. Попробуйте ещё раз',
    PROVIDER_KEY_MANAGEMENT_FORBIDDEN: 'Ключом управляет только владелец',
    PROVIDER_KEY_NOT_FOUND: 'Ключа нет',
    PROVIDER_KEY_MISSING:
      'В пространстве нет ключа OpenRouter. Владелец добавит его в настройках',
    WORKSPACE_SUSPENDED: 'Пространство приостановлено',
    CONVERSATION_NOT_FOUND: 'Такого разговора нет',
    CONVERSATION_BUSY:
      'Агент ещё отвечает в этом разговоре. Подождите и повторите',
    AGENTS_NOT_PUBLISHED:
      'Агенты Intentra ещё не опубликованы. Обратитесь к администратору платформы',
    INVALID_CONVERSATION_TITLE: 'Название — от 1 до 200 символов',
    NOT_PLATFORM_ADMIN: 'Это может только администратор платформы',
    AGENT_NOT_FOUND: 'Такого агента нет',
    SKILL_NOT_FOUND: 'Такого Skill нет',
    MODEL_PROFILE_NOT_FOUND: 'Такой модели нет',
    INVALID_AGENT: 'Проверьте поля агента',
    INVALID_SKILL: 'Проверьте поля Skill',
    INVALID_MODEL_PROFILE: 'Проверьте поля модели',
    SKILL_NAME_TAKEN: 'Skill с таким именем уже есть',
    INTENTRA_EXISTS: 'Intentra уже есть',
    AUDITOR_EXISTS: 'Auditor уже есть',
    ANALYSIS_RUN_BUSY: 'Проверка уже идёт',
    ANALYSIS_RUN_FORBIDDEN:
      'Проверять непроверенное могут те, кто пишет или утверждает в проекте, а весь проект заново — только тот, кто утверждает',
    ANALYSIS_RUN_NOT_FOUND: 'Такой проверки нет',
    ANALYSIS_SCHEDULE_FORBIDDEN:
      'Ночную проверку переключает тот, кто утверждает в проекте',
    AUDITOR_NOT_REMOVABLE: 'Auditor удалить нельзя',
    INTENTRA_NOT_REMOVABLE: 'Intentra удалить нельзя',
    MODEL_PROFILE_IN_USE:
      'На этой модели работают агенты. Сначала переведите их на другую',
    AGENTS_UNCHANGED: 'Публиковать нечего: изменений нет',
    AGENTS_NOT_PUBLISHABLE:
      'Опубликовать нельзя: исправьте то, что мешает публикации',
    INVALID_PUBLISHING_NOTE: 'Заметка — не больше 500 символов',
    PERSONAL_ACCESS_TOKEN_REVOCATION_FORBIDDEN:
      'Отозвать этот токен может только его автор или владелец',
  },
} as const;
