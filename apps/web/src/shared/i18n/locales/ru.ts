/** The interface's Russian texts; the only language for now (ADR 0003). */
export const ru = {
  brand: 'Intentra',
  fields: {
    email: 'Email',
    password: 'Пароль',
    repeatPassword: 'Повторите пароль',
    passwordHint: 'Не меньше 8 символов.',
    passwordsDiffer: 'Пароли не совпадают',
  },
  signIn: {
    title: 'С возвращением',
    description: 'Войдите в свои пространства.',
    submit: 'Войти',
    noAccount: 'Нет аккаунта?',
    toSignUp: 'Регистрация',
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
  home: {
    signedInAs: 'Вы вошли как {{email}}',
  },
  signOut: {
    submit: 'Выйти',
  },
  theme: {
    label: 'Тема',
    system: 'Как в системе',
    light: 'Светлая',
    dark: 'Тёмная',
  },
  errors: {
    fallback: 'Что-то пошло не так. Попробуйте ещё раз',
    INVALID_CREDENTIALS: 'Неверный email или пароль',
    ACCOUNT_ALREADY_EXISTS: 'Аккаунт с этим email уже есть',
    VALIDATION_FAILED: 'Проверьте введённые данные',
    UNAUTHENTICATED: 'Войдите снова',
    INTERNAL: 'На сервере что-то сломалось. Попробуйте позже',
    NETWORK_ERROR: 'Нет связи с сервером. Проверьте подключение',
  },
} as const;
