import { ConflictException, UnauthorizedException } from '@nestjs/common';

export class InvalidCredentials extends UnauthorizedException {
  constructor(message = 'Неверный email или пароль') {
    super(message, { description: 'INVALID_CREDENTIALS' });
  }
}

export class InvalidRefreshToken extends UnauthorizedException {
  constructor(message = 'Недействительный refresh token') {
    super(message, { description: 'INVALID_REFRESH_TOKEN' });
  }
}

export class EmailAlreadyTaken extends ConflictException {
  constructor(message = 'Этот email уже занят') {
    super(message, { description: 'EMAIL_ALREADY_TAKEN' });
  }
}
