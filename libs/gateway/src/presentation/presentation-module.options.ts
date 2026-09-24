import type { ModuleMetadata } from '@nestjs/common';

// Modules that provide the context ports (IamApi, WorkspaceApi, ...). Every
// presentation module imports them itself: imports of the parent module are
// not visible here. Pass the same module objects to all of them: Nest shares a
// dynamic module only while it is the same object, so a second
// `IamModule.register({})` would create a second IAM.
export type PresentationModuleOptions = {
  readonly contexts: NonNullable<ModuleMetadata['imports']>;
};
