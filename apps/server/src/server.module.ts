import { Module } from '@nestjs/common';

import { IamModule } from '@intentra/iam';

@Module({
  imports: [
    IamModule.register({
      database: {
        host: 'localhost',
        name: 'iam',
        username: '',
        password: '',
      },
    }),
  ],
})
export class ServerModule {}
