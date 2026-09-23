import type { ModuleMetadata } from '@nestjs/common';

// Modules that provide the context ports (AccountApi, ...). Every presentation
// module imports them itself: imports of the parent module are not visible here.
export type PresentationModuleOptions = {
  readonly contexts: NonNullable<ModuleMetadata['imports']>;
};
