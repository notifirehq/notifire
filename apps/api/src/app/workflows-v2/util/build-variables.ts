import _ from 'lodash';

import { PinoLogger } from '@novu/application-generic';

import { Variable, extractLiquidTemplateVariables, TemplateVariables } from './template-parser/liquid-parser';
import { transformMailyContentToLiquid } from '../usecases/generate-preview/transform-maily-content-to-liquid';
import { isStringTipTapNode } from './tip-tap.util';

export function buildVariables(
  variableSchema: Record<string, unknown> | undefined,
  controlValue: unknown | Record<string, unknown>,
  logger?: PinoLogger
): TemplateVariables {
  let variableControlValue = controlValue;

  if (isStringTipTapNode(variableControlValue)) {
    try {
      variableControlValue = transformMailyContentToLiquid(JSON.parse(variableControlValue));
    } catch (error) {
      logger?.error(
        {
          err: error as Error,
          controlKey: 'unknown',
          message: 'Failed to transform maily content to liquid syntax',
        },
        'BuildVariables'
      );
    }
  }

  const { validVariables, invalidVariables } = extractLiquidTemplateVariables(JSON.stringify(variableControlValue));

  const { validVariables: validSchemaVariables, invalidVariables: invalidSchemaVariables } = identifyUnknownVariables(
    variableSchema || {},
    validVariables
  );

  return {
    validVariables: validSchemaVariables,
    invalidVariables: [...invalidVariables, ...invalidSchemaVariables],
  };
}

export function isPropertyAllowed(
  schema: Record<string, unknown>,
  propertyPath: string,
  { strict = true }: { strict?: boolean } = {}
) {
  let currentSchema = { ...schema };
  if (!currentSchema || typeof currentSchema !== 'object') {
    return false;
  }

  const pathParts = propertyPath.split('.');

  for (const part of pathParts) {
    const { properties, additionalProperties } = currentSchema;

    if (properties?.[part]) {
      currentSchema = properties[part];
      continue;
    }

    if (strict && additionalProperties === true) {
      return true;
    }

    return false;
  }

  return true;
}

function createInvalidVariable(variable: Variable): Variable {
  return {
    name: variable.output,
    context: variable.context,
    message: 'Variable is not supported',
    output: variable.output,
  };
}

function identifyUnknownVariables(
  variableSchema: Record<string, unknown>,
  validVariables: Variable[]
): TemplateVariables {
  const variables = _.cloneDeep(validVariables);

  return variables.reduce<TemplateVariables>(
    (acc, variable) => {
      const isValid = isPropertyAllowed(variableSchema, variable.name);

      if (isValid) {
        acc.validVariables.push(variable);
      } else {
        acc.invalidVariables.push(createInvalidVariable(variable));
      }

      return acc;
    },
    { validVariables: [], invalidVariables: [] }
  );
}
