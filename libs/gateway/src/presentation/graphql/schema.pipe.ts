import {
  StandardSchemaValidationPipe,
  type ArgumentMetadata,
  type PipeTransform,
} from '@nestjs/common';

/**
 * `@Args()` has no `schema` option, so the global
 * `StandardSchemaValidationPipe` skips GraphQL arguments. This pipe hands it
 * the contract schema, so an argument is checked the same way as a REST body:
 * `@Args('input', new SchemaPipe(SignUpDtoSchema))`.
 */
export class SchemaPipe implements PipeTransform {
  private readonly pipe = new StandardSchemaValidationPipe();

  constructor(
    private readonly schema: NonNullable<ArgumentMetadata['schema']>,
  ) {}

  public transform(value: unknown, metadata: ArgumentMetadata) {
    return this.pipe.transform(value, { ...metadata, schema: this.schema });
  }
}
