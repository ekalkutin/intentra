import { IamApi } from '@intentra/iam-contracts';

export abstract class IamApiPort implements IamApi {
  abstract readonly auth: IamApi['auth'];
}
