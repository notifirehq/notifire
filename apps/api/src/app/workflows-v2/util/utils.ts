/* eslint-disable no-param-reassign */
import difference from 'lodash/difference';
import flatMap from 'lodash/flatMap';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import reduce from 'lodash/reduce';
import values from 'lodash/values';

import { MAILY_ITERABLE_MARK } from '@novu/application-generic';
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
 * Converts an array of dot-notation paths into a nested object structure.
 * Each leaf node value will be the original path wrapped in handlebars syntax {{path}}.
 * Handles both object and array paths (using .0. notation for arrays).
 *
 * @example
 * Input: ['user.name', 'user.addresses.0.street']
 * Output: {
 *   user: {
 *     name: '{{user.name}}',
 *     addresses: [
 *       { street: '{{user.addresses.street}}' },
 *     ]
 *   }
 * }
 */
export function keysToObject(paths: string[]): Record<string, unknown> {
  const result = {};

  const validPaths = paths
    .filter(hasNamespace)
    // remove paths that are a prefix of another path
    .filter((path) => !paths.some((otherPath) => otherPath !== path && otherPath.startsWith(`${path}.`)));

  validPaths.filter(hasNamespace).forEach((path) => buildPathInObject(path, result));

  return result;
}

function hasNamespace(path: string): boolean {
  return path.includes('.');
}

function buildPathInObject(path: string, result: Record<string, any>): void {
  const parts = path.split('.');
  let current = result;

  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = parts[i];

    if (isArrayNotation(parts[i + 1])) {
      current = handleArrayPath(current, key);
      i += 1; // Skip the index path part ("0")
      continue;
    }

    current = handleObjectPath(current, key);
  }

  setFinalLeafValue(current, parts[parts.length - 1], path);
}

function isArrayNotation(part: string): boolean {
  return part === MAILY_ITERABLE_MARK;
}

function handleArrayPath(current: Record<string, any>, key: string): Record<string, any> {
  if (!Array.isArray(current[key])) {
    current[key] = [{}];
  }

  return current[key][0];
}

function handleObjectPath(current: Record<string, any>, key: string): Record<string, any> {
  current[key] = current[key] || {};

  return current[key];
}

function setFinalLeafValue(current: Record<string, any>, lastPart: string, fullPath: string): void {
  if (lastPart !== '0') {
    current[lastPart] = `{{${fullPath.replace('.0.', '.')}}}`;
  }
}

/**
 * Duplicates array items within an object structure to create sample data.
 * Recursively processes nested objects and arrays, creating multiple copies of array items.
 *
 * @example
 * const input = {
 *   users: [{
 *     name: "John",
 *     addresses: [{ city: "NYC" }]
 *   }]
 * };
 *
 * duplicateArrayItems(input);
 *  Returns:
 *  {
 *    users: [
 *      { name: "John", addresses: [{ city: "NYC" }] },
 *      { name: "John", addresses: [{ city: "NYC" }] },
 *      { name: "John", addresses: [{ city: "NYC" }] }
 *    ]
 *  }
 */
export function multiplyArrayItems(obj: Record<string, unknown>, multiplyBy = 3): Record<string, unknown> {
  const result = { ...obj };

  Object.entries(result).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      result[key] = Array(multiplyBy)
        .fill(null)
        .map(() => ({ ...value[0] }));
    } else if (typeof value === 'object' && value !== null) {
      result[key] = multiplyArrayItems(value as Record<string, unknown>, multiplyBy);
    }
  });

  return result;
}

/**
 * Recursively merges common/overlapping object keys from source into target.
 *
 * @example
 * Target: { subscriber: { phone: '{{subscriber.phone}}', name: '{{subscriber.name}}' } }
 * Source: { subscriber: { phone: '123' }, payload: { someone: '{{payload.someone}}' }}
 * Result: { subscriber: { phone: '123', name: '{{subscriber.name}}' } }
 */
export function mergeCommonObjectKeys(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  return Object.entries(target).reduce(
    (merged, [key, targetValue]) => {
      const sourceValue = source[key];

      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        merged[key] = targetValue.map((_, index) => {
          if (index < sourceValue.length) {
            // if we have a corresponding source item, use it
            return sourceValue[index];
          }

          // otherwise keep the target item
          return targetValue[index];
        });
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        merged[key] = mergeCommonObjectKeys(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        );
      } else {
        merged[key] = sourceValue ?? targetValue;
      }

      return merged;
    },
    {} as Record<string, unknown>
  );
}
