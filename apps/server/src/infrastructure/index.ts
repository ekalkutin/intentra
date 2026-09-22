import { Provider } from '@nestjs/common';

import { IamClientPort, WorkspaceClientPort } from '@intentra/api-ports';
import { IamApiPort } from '@intentra/iam';
import { WorkspaceApiPort } from '@intentra/workspace';

/**
 * Связка монолита: клиентские порты разрешаются в этом же процессе.
 *
 * Единственный файл, который меняется при выделении контекста в сервис — там
 * вместо `useExisting` встанет RPC-клиент, и ни один потребитель об этом не
 * узнает. IAM и Workspace друг на друга здесь не связываются: между собой они
 * общаются через опубликованный API и события, а не через этот корень.
 */
export const LOCAL_PROVIDERS: Provider[] = [
  { provide: IamClientPort, useExisting: IamApiPort },
  { provide: WorkspaceClientPort, useExisting: WorkspaceApiPort },
];
