import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { DynamicModule, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import type { PresentationModuleOptions } from '../presentation-module.options.js';

import { AGENTS_GQL_RESOLVERS } from './agents/index.js';
import { formatGraphQLError } from './format-error.js';
import { IAM_GQL_LOADERS, IAM_GQL_RESOLVERS } from './iam/index.js';
import {
  WORKSPACE_GQL_LOADERS,
  WORKSPACE_GQL_RESOLVERS,
} from './workspace/index.js';

@Module({})
export class GQLModule {
  static register({
    contexts,
    auth,
  }: PresentationModuleOptions): DynamicModule {
    return {
      module: GQLModule,
      imports: [
        ...contexts,
        auth,
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          // In memory, not a file: nothing reads an SDL dump, and a client
          // codegen can read the schema from the running endpoint.
          autoSchemaFile: true,
          sortSchema: true,
          // RouterModule prefixes controllers only; Apollo mounts its own
          // middleware, so the gateway's `api` prefix is spelled out here.
          path: '/api/graphql',
          playground: false,
          plugins: [ApolloServerPluginLandingPageLocalDefault()],
          context: ({ req }: { req: unknown }) => ({ req }),
          includeStacktraceInErrorResponses: false,
          formatError: formatGraphQLError,
        }),
      ],
      providers: [
        ...IAM_GQL_RESOLVERS,
        ...WORKSPACE_GQL_RESOLVERS,
        ...AGENTS_GQL_RESOLVERS,
        ...IAM_GQL_LOADERS,
        ...WORKSPACE_GQL_LOADERS,
      ],
    };
  }
}
