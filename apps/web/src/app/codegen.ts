import { type CodegenConfig } from '@graphql-codegen/cli';

const GRAPHQL_SCHEMA =
  process.env.GRAPHQL_SCHEMA ?? 'http://localhost:3000/api/graphql';

const config: CodegenConfig = {
  overwrite: true,
  schema: GRAPHQL_SCHEMA,
  documents: ['src/**/*.{ts,tsx}', '!src/**/__generated__/**'],
  ignoreNoDocuments: true,
  generates: {
    './src/app/graphql.ts': {
      plugins: ['typescript'],
      config: {
        // TS enums are not erasable syntax (`erasableSyntaxOnly` in tsconfig.app.json)
        enumsAsTypes: true,
      },
    },
    './src/': {
      preset: 'near-operation-file',
      presetConfig: {
        baseTypesPath: './app/graphql.ts',
        folder: '__generated__',
      },
      plugins: [
        { add: { content: '// @ts-nocheck' } },
        'typescript-operations',
        'typed-document-node',
      ],
      config: {
        avoidOptionals: {
          field: true,
          inputValue: false,
        },
        defaultScalarType: 'unknown',
        nonOptionalTypename: true,
        skipTypeNameForRoot: true,
      },
    },
  },
};

export default config;
