import { Injectable, InternalServerErrorException } from '@nestjs/common';
import _ from 'lodash';
import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { captureException } from '@sentry/node';

import {
  ChannelTypeEnum,
  createMockObjectFromSchema,
  GeneratePreviewResponseDto,
  JobStatusEnum,
  PreviewPayload,
  StepDataDto,
  WorkflowOriginEnum,
  TipTapNode,
  StepTypeEnum,
} from '@novu/shared';
import {
  GetWorkflowByIdsCommand,
  GetWorkflowByIdsUseCase,
  WorkflowInternalResponseDto,
  Instrument,
  InstrumentUsecase,
  PinoLogger,
  dashboardSanitizeControlValues,
} from '@novu/application-generic';
import { channelStepSchemas, actionStepSchemas } from '@novu/framework/internal';

import { PreviewStep, PreviewStepCommand } from '../../../bridge/usecases/preview-step';
import { FrameworkPreviousStepsOutputState } from '../../../bridge/usecases/preview-step/preview-step.command';
import { BuildStepDataUsecase } from '../build-step-data';
import { GeneratePreviewCommand } from './generate-preview.command';
import { BuildPayloadSchemaCommand } from '../build-payload-schema/build-payload-schema.command';
import { BuildSchemasByControlValues } from '../build-payload-schema/build-payload-schema.usecase';
import { Variable } from '../../util/template-parser/liquid-parser';
import { keysToObject } from '../../util/utils';
import { isObjectTipTapNode } from '../../util/tip-tap.util';
import { buildVariables, isPropertyAllowed } from '../../util/build-variables';

const LOG_CONTEXT = 'GeneratePreviewUsecase';

@Injectable()
export class GeneratePreviewUsecase {
  constructor(
    private previewStepUsecase: PreviewStep,
    private buildStepDataUsecase: BuildStepDataUsecase,
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private buildSchemasByControlValues: BuildSchemasByControlValues,
    private readonly logger: PinoLogger
  ) {}

  @InstrumentUsecase()
  async execute(command: GeneratePreviewCommand): Promise<GeneratePreviewResponseDto> {
    try {
      const {
        stepData,
        controlValues: initialControlValues,
        variableSchema,
        workflow,
      } = await this.initializePreviewContext(command);
      const commandVariablesExample = command.generatePreviewRequestDto.previewPayload;

      /**
       * We don't want to sanitize control values for code workflows,
       * as it's the responsibility of the custom code workflow creator
       */
      const sanitizedValidatedControls =
        workflow.origin === WorkflowOriginEnum.NOVU_CLOUD
          ? this.sanitizeControlsForPreview(initialControlValues, stepData)
          : initialControlValues;

      if (!sanitizedValidatedControls && workflow.origin === WorkflowOriginEnum.NOVU_CLOUD) {
        throw new Error(
          // eslint-disable-next-line max-len
          'Control values normalization failed, normalizeControlValues function requires maintenance to sanitize the provided type or data structure correctly'
        );
      }

      let previewTemplateData = {
        variablesExample: {},
        controlValues: {},
      };

      for (const [controlKey, controlValue] of Object.entries(sanitizedValidatedControls || {})) {
        const variables = buildVariables(variableSchema, controlValue, this.logger);
        const processedControlValues = this.fixControlValueInvalidVariables(controlValue, variables.invalidVariables);

        const validVariableNames = variables.validVariables.map((variable) => variable.name);
        const variablesExampleResult = keysToObject(validVariableNames, { fn: (key) => `{{${key}}}` });

        previewTemplateData = {
          variablesExample: _.merge(previewTemplateData.variablesExample, variablesExampleResult),
          controlValues: {
            ...previewTemplateData.controlValues,
            [controlKey]: isObjectTipTapNode(processedControlValues)
              ? JSON.stringify(processedControlValues)
              : processedControlValues,
          },
        };
      }

      const variablesExample = this.buildVariablesExample(
        workflow,
        previewTemplateData,
        commandVariablesExample,
        variableSchema
      );
      const executeOutput = await this.executePreviewUsecase(
        command,
        stepData,
        variablesExample,
        previewTemplateData.controlValues
      );

      return {
        result: {
          preview: executeOutput.outputs as any,
          type: stepData.type as unknown as ChannelTypeEnum,
        },
        previewPayloadExample: variablesExample,
      };
    } catch (error) {
      this.logger.error(
        {
          err: error,
          workflowIdOrInternalId: command.workflowIdOrInternalId,
          stepIdOrInternalId: command.stepIdOrInternalId,
        },
        `Unexpected error while generating preview`,
        LOG_CONTEXT
      );
      if (process.env.SENTRY_DSN) {
        captureException(error);
      }

      return {
        result: {
          preview: {},
          type: undefined,
        },
        previewPayloadExample: {},
      } as any;
    }
  }

  private sanitizeControlsForPreview(initialControlValues: Record<string, unknown>, stepData: StepDataDto) {
    const sanitizedValues = dashboardSanitizeControlValues(this.logger, initialControlValues, stepData.type);

    return sanitizeControlValuesByOutputSchema(sanitizedValues || {}, stepData.type);
  }

  private buildVariablesExample(
    workflow: WorkflowInternalResponseDto,
    previewTemplateData: { variablesExample: {}; controlValues: {} },
    commandVariablesExample: PreviewPayload | undefined,
    variableSchema: Record<string, unknown>
  ) {
    let finalVariablesExample = {};
    if (workflow.origin === WorkflowOriginEnum.EXTERNAL) {
      /*
       * if external workflow, we need to override with stored payload schema
       * ** this is place is to late and wrong, id the variableSchema is properly build this wont be needed
       */
      const tmp = createMockObjectFromSchema({
        type: 'object',
        properties: { payload: workflow.payloadSchema },
      });
      finalVariablesExample = { ...previewTemplateData.variablesExample, ...tmp };
    } else {
      finalVariablesExample = previewTemplateData.variablesExample;
    }

    finalVariablesExample = _.merge(finalVariablesExample, commandVariablesExample);
    const variablesExample = this.removeStaleVariables(finalVariablesExample, variableSchema);

    return variablesExample;
  }

  private async initializePreviewContext(command: GeneratePreviewCommand) {
    const stepData = await this.getStepData(command);
    const controlValues = command.generatePreviewRequestDto.controlValues || stepData.controls.values || {};
    const workflow = await this.findWorkflow(command);
    const variableSchema = await this.buildVariablesSchema(stepData.variables, command, controlValues);

    return { stepData, controlValues, variableSchema, workflow };
  }

  @Instrument()
  private async buildVariablesSchema(
    variableSchema: Record<string, unknown>,
    command: GeneratePreviewCommand,
    controlValues: Record<string, unknown>
  ) {
    const { payloadSchema, subscriberSchema: buildSubscriberSchema } = await this.buildSchemasByControlValues.execute(
      BuildPayloadSchemaCommand.create({
        environmentId: command.user.environmentId,
        organizationId: command.user.organizationId,
        userId: command.user._id,
        workflowId: command.workflowIdOrInternalId,
        controlValues,
      })
    );

    const subscriberDataSchema = {
      properties: {
        data: buildSubscriberSchema?.properties?.data || {},
      },
    };

    return _.merge(variableSchema, { properties: { payload: payloadSchema, subscriber: subscriberDataSchema } });
  }

  @Instrument()
  private async findWorkflow(command: GeneratePreviewCommand) {
    return await this.getWorkflowByIdsUseCase.execute(
      GetWorkflowByIdsCommand.create({
        workflowIdOrInternalId: command.workflowIdOrInternalId,
        environmentId: command.user.environmentId,
        organizationId: command.user.organizationId,
        userId: command.user._id,
      })
    );
  }

  @Instrument()
  private async getStepData(command: GeneratePreviewCommand) {
    return await this.buildStepDataUsecase.execute({
      workflowIdOrInternalId: command.workflowIdOrInternalId,
      stepIdOrInternalId: command.stepIdOrInternalId,
      user: command.user,
    });
  }

  private isFrameworkError(obj: any): obj is FrameworkError {
    return typeof obj === 'object' && obj.status === '400' && obj.name === 'BridgeRequestError';
  }

  @Instrument()
  private async executePreviewUsecase(
    command: GeneratePreviewCommand,
    stepData: StepDataDto,
    hydratedPayload: PreviewPayload,
    controlValues: Record<string, unknown>
  ) {
    const state = buildState(hydratedPayload.steps);
    try {
      return await this.previewStepUsecase.execute(
        PreviewStepCommand.create({
          payload: hydratedPayload.payload || {},
          subscriber: hydratedPayload.subscriber,
          controls: controlValues || {},
          environmentId: command.user.environmentId,
          organizationId: command.user.organizationId,
          stepId: stepData.stepId,
          userId: command.user._id,
          workflowId: stepData.workflowId,
          workflowOrigin: stepData.origin,
          state,
        })
      );
    } catch (error) {
      if (this.isFrameworkError(error)) {
        throw new GeneratePreviewError(error);
      } else {
        throw error;
      }
    }
  }

  private fixControlValueInvalidVariables(
    controlValues: unknown,
    invalidVariables: Variable[]
  ): Record<string, unknown> {
    try {
      let controlValuesString = JSON.stringify(controlValues);

      for (const invalidVariable of invalidVariables) {
        if (!controlValuesString.includes(invalidVariable.output)) {
          continue;
        }

        const EMPTY_STRING = '';
        controlValuesString = replaceAll(controlValuesString, invalidVariable.output, EMPTY_STRING);
      }

      return JSON.parse(controlValuesString) as Record<string, unknown>;
    } catch (error) {
      return controlValues as Record<string, unknown>;
    }
  }

  private removeStaleVariables(
    commandVariables: PreviewPayload | undefined,
    variableSchema: Record<string, unknown>
  ): PreviewPayload | {} {
    if (!commandVariables) {
      return {};
    }

    const normalizedVariables = _.cloneDeep(commandVariables);
    const flattenedObject = flat(normalizedVariables);

    const invalidKeys = Object.keys(flattenedObject).filter(
      (key) => !isPropertyAllowed(variableSchema as Record<string, unknown>, key, { strict: false })
    );
    invalidKeys.forEach((key) => {
      _.unset(normalizedVariables, key);
    });

    return normalizedVariables;
  }
}

function buildState(steps: Record<string, unknown> | undefined): FrameworkPreviousStepsOutputState[] {
  const outputArray: FrameworkPreviousStepsOutputState[] = [];
  for (const [stepId, value] of Object.entries(steps || {})) {
    outputArray.push({
      stepId,
      outputs: value as Record<string, unknown>,
      state: {
        status: JobStatusEnum.COMPLETED,
      },
    });
  }

  return outputArray;
}

/**
 * Replaces all occurrences of a search string with a replacement string.
 */
export function replaceAll(text: string, searchValue: string, replaceValue: string): string {
  return _.replace(text, new RegExp(_.escapeRegExp(searchValue), 'g'), replaceValue);
}

export class GeneratePreviewError extends InternalServerErrorException {
  constructor(error: FrameworkError) {
    super({
      message: `GeneratePreviewError: Original Message:`,
      frameworkMessage: error.response.message,
      code: error.response.code,
      data: error.response.data,
    });
  }
}

class FrameworkError {
  response: {
    message: string;
    code: string;
    data: unknown;
  };
  status: number;
  options: Record<string, unknown>;
  message: string;
  name: string;
}

function sanitizeControlValuesByOutputSchema(
  controlValues: Record<string, unknown>,
  type: StepTypeEnum
): Record<string, unknown> {
  const outputSchema = channelStepSchemas[type].output || actionStepSchemas[type].output;

  if (!outputSchema || !controlValues) {
    return controlValues;
  }

  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  const validate = ajv.compile(outputSchema);
  const isValid = validate(controlValues);
  const errors = validate.errors as null | ErrorObject[];

  if (isValid || !errors || errors?.length === 0) {
    return controlValues;
  }

  return replaceInvalidControlValues(controlValues, errors);
}

/**
 * Fixes invalid control values by applying default values from the schema
 *
 * @example
 * // Input:
 * const values = { foo: 'invalid' };
 * const errors = [{ instancePath: '/foo' }];
 * const defaults = { foo: 'default' };
 *
 * // Output:
 * const fixed = { foo: 'default' };
 */
function replaceInvalidControlValues(
  normalizedControlValues: Record<string, unknown>,
  errors: ErrorObject[]
): Record<string, unknown> {
  const fixedValues = _.cloneDeep(normalizedControlValues);

  errors.forEach((error) => {
    const path = getErrorPath(error);
    const defaultValue = _.get(previewControlValueDefault, path);
    _.set(fixedValues, path, defaultValue);
  });

  return fixedValues;
}

/*
 * Extracts the path from the error object:
 * 1. If instancePath exists, removes leading slash and converts remaining slashes to dots
 * 2. If no instancePath, uses missingProperty from error params
 * Example: "/foo/bar" becomes "foo.bar"
 */
function getErrorPath(error: ErrorObject): string {
  return (error.instancePath.substring(1) || error.params.missingProperty).replace(/\//g, '.');
}

const EMPTY_STRING = '';
const WHITESPACE = ' ';
const DEFAULT_URL_TARGET = '_blank';
const DEFAULT_URL_PATH = 'https://www.redirect-example.com';
const DEFAULT_TIP_TAP_EMPTY_PREVIEW: TipTapNode = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      attrs: {
        textAlign: 'left',
      },
      content: [
        {
          type: 'text',
          text: EMPTY_STRING,
        },
      ],
    },
  ],
};

/**
 * Default control values used specifically for preview purposes.
 * These values are designed to be parsable by Liquid.js and provide
 * safe fallback values when generating preview.
 */
export const previewControlValueDefault = {
  subject: EMPTY_STRING,
  body: WHITESPACE,
  avatar: DEFAULT_URL_PATH,
  emailEditor: DEFAULT_TIP_TAP_EMPTY_PREVIEW,
  data: {},
  'primaryAction.label': EMPTY_STRING,
  'primaryAction.redirect.url': DEFAULT_URL_PATH,
  'primaryAction.redirect.target': DEFAULT_URL_TARGET,
  'secondaryAction.label': EMPTY_STRING,
  'secondaryAction.redirect.url': DEFAULT_URL_PATH,
  'secondaryAction.redirect.target': DEFAULT_URL_TARGET,
  'redirect.url': DEFAULT_URL_PATH,
  'redirect.target': DEFAULT_URL_TARGET,
} as const;

function flat(obj: Record<string, unknown>): Record<string, unknown> {
  const flattenedObject = {};
  const flattenObject = (innerObject: Record<string, unknown>, prefix = '') => {
    for (const [key, value] of Object.entries(innerObject)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        flattenObject(value as Record<string, unknown>, newKey);
      } else {
        flattenedObject[newKey] = value;
      }
    }
  };
  flattenObject(obj);

  return flattenedObject;
}
