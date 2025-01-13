import difference from 'lodash/difference';
import flatMap from 'lodash/flatMap';
import reduce from 'lodash/reduce';
import set from 'lodash/set';
import values from 'lodash/values';
import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';

import { BadRequestException } from '@nestjs/common';

import { JSONSchemaDto } from '@novu/shared';

export function findMissingKeys(requiredRecord: object, actualRecord: object) {
  const requiredKeys = collectKeys(requiredRecord);
  const actualKeys = collectKeys(actualRecord);

  return difference(requiredKeys, actualKeys);
}

export function collectKeys(obj, prefix = '') {
  return reduce(
    obj,
    (result, value, key) => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (isObject(value) && !isArray(value)) {
        result.push(...collectKeys(value, newKey));
      } else {
        result.push(newKey);
      }

      return result;
    },
    []
  );
}

/**
 * Recursively flattens an object's values into an array of strings.
 * Handles nested objects, arrays, and converts primitive values to strings.
 *
 * @param obj - The object to flatten
 * @returns An array of strings containing all primitive values found in the object
 *
 * @example
 * ```typescript
 * const input = {
 *   subject: "Hello {{name}}",
 *   body: "Welcome!",
 *   actions: {
 *     primary: {
 *       label: "Click {{here}}",
 *       url: "https://example.com"
 *     }
 *   },
 *   data: { count: 42 }
 * };
 *
 * flattenObjectValues(input);
 *  Returns:
 *  [
 *    "Hello {{name}}",
 *    "Welcome!",
 *    "Click {{here}}",
 *    "https://example.com",
 *    "42"
 *  ]
 * ```
 */
export function flattenObjectValues(obj: Record<string, unknown>): string[] {
  return flatMap(values(obj), (value) => {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (value && typeof value === 'object') {
      return flattenObjectValues(value as Record<string, unknown>);
    }

    return [];
  });
}

/**
 * Recursively adds missing defaults for properties in a JSON schema object.
 * For properties without defaults, adds interpolated path as the default value.
 * Handles nested objects by recursively processing their properties.
 *
 * @param {Object} schema - The JSON schema object to process
 * @param {string} parentPath - The parent path for building default values (default: 'payload')
 * @returns {Object} The schema with missing defaults added
 *
 * @example
 * const schema = {
 *   properties: {
 *     name: { type: 'string' },
 *     address: {
 *       type: 'object',
 *       properties: {
 *         street: { type: 'string' }
 *       }
 *     }
 *   }
 * };
 *
 * const result = addMissingDefaults(schema);
 * // Result:
 * // {
 * //   properties: {
 * //     name: {
 * //       type: 'string',
 * //       default: '{{payload.name}}'
 * //     },
 * //     address: {
 * //       type: 'object',
 * //       properties: {
 * //         street: {
 * //           type: 'string',
 * //           default: '{{payload.address.street}}'
 * //         }
 * //       }
 * //     }
 * //   }
 * // }
 */
export function mockSchemaDefaults(schema: JSONSchemaDto, parentPath = 'payload', depth = 0) {
  const MAX_DEPTH = 10;

  if (depth >= MAX_DEPTH) {
    return schema;
  }

  if (schema.properties) {
    Object.entries(schema.properties).forEach(([key, value]) => {
      const valueDto = value as JSONSchemaDto;
      if (valueDto.type === 'object') {
        mockSchemaDefaults(valueDto, `${parentPath}.${key}`, depth + 1);
      }

      if (!valueDto.default && valueDto.type !== 'object') {
        valueDto.default = `{{${parentPath}.${key}}}`;
      }
    });
  }

  return schema;
}

/**
 *
 * Converts an array of dot-notation paths into a nested object structure,
 * setting each path's value to the path itself.
 *
 * @param keys - Array of dot-notation paths
 * @param options - Optional configuration object
 *  - fn: Callback function to transform each path's value (default: identity function)
 * @returns Nested object with paths as values
 * @warning Entries without a namespace (no dots) will be ignored.
 * @example
 * keysToObject(['payload.old', 'payload.new', 'payload'])
 * // Returns: { payload: { old: 'payload.old', new: 'payload.new' } }
 * // Note: 'payload' entry is ignored as it has no namespace
 */
export function keysToObject(
  keys: string[],
  { fn }: { fn: (key: string) => string | boolean } = { fn: (key: string) => key }
) {
  const result: Record<string, Record<string, unknown> | undefined> = {};
  keys.filter((key) => key.includes('.')).forEach((key) => set(result, key, fn(key)));

  return result;
}
