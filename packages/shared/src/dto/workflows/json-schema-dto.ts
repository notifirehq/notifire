/**
 * Json Schema version 7.
 *
 * Note: Copied verbatim from import(`json-schema-to-ts`).JSONSchema.
 * This is to avoid a dependency on `json-schema-to-ts` in the shared package when
 * Framework can't be depended on, to avoid circular dependencies.
 */

export declare const $JSONSchema: unique symbol;
export type $JSONSchema = typeof $JSONSchema;
export type JSONSchemaType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null';
export type JSONSchema =
  | boolean
  | Readonly<{
      [$JSONSchema]?: $JSONSchema;
      $id?: string | undefined;
      $ref?: string | undefined;
      $schema?: string | undefined;
      $comment?: string | undefined;
      type?: JSONSchemaType | readonly JSONSchemaType[];
      const?: unknown;
      enum?: unknown;
      multipleOf?: number | undefined;
      maximum?: number | undefined;
      exclusiveMaximum?: number | undefined;
      minimum?: number | undefined;
      exclusiveMinimum?: number | undefined;
      maxLength?: number | undefined;
      minLength?: number | undefined;
      pattern?: string | undefined;
      items?: JSONSchema | readonly JSONSchema[];
      additionalItems?: JSONSchema;
      contains?: JSONSchema;
      maxItems?: number | undefined;
      minItems?: number | undefined;
      uniqueItems?: boolean | undefined;
      maxProperties?: number | undefined;
      minProperties?: number | undefined;
      required?: readonly string[];
      properties?: Readonly<Record<string, JSONSchema>>;
      patternProperties?: Readonly<Record<string, JSONSchema>>;
      additionalProperties?: JSONSchema;
      unevaluatedProperties?: JSONSchema;
      dependencies?: Readonly<Record<string, JSONSchema | readonly string[]>>;
      propertyNames?: JSONSchema;
      if?: JSONSchema;
      then?: JSONSchema;
      else?: JSONSchema;
      allOf?: readonly JSONSchema[];
      anyOf?: readonly JSONSchema[];
      oneOf?: readonly JSONSchema[];
      not?: JSONSchema;
      format?: string | undefined;
      contentMediaType?: string | undefined;
      contentEncoding?: string | undefined;
      definitions?: Readonly<Record<string, JSONSchema>>;
      title?: string | undefined;
      description?: string | undefined;
      default?: unknown;
      readOnly?: boolean | undefined;
      writeOnly?: boolean | undefined;
      examples?: readonly unknown[];
      nullable?: boolean;
    }>;
export type JSONSchemaReference = JSONSchema &
  Readonly<{
    $id: string;
  }>;

export type JSONSchemaDto = Exclude<JSONSchema, boolean>;
