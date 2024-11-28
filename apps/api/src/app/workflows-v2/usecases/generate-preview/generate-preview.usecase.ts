import { Injectable, InternalServerErrorException } from '@nestjs/common';
import _ from 'lodash';
import {
  ChannelTypeEnum,
  GeneratePreviewRequestDto,
  GeneratePreviewResponseDto,
  JobStatusEnum,
  JSONSchemaDto,
  PreviewPayload,
  StepDataDto,
  WorkflowOriginEnum,
} from '@novu/shared';
import {
  GetWorkflowByIdsCommand,
  GetWorkflowByIdsUseCase,
  WorkflowInternalResponseDto,
} from '@novu/application-generic';
import { PreviewStep, PreviewStepCommand } from '../../../bridge/usecases/preview-step';
import { FrameworkPreviousStepsOutputState } from '../../../bridge/usecases/preview-step/preview-step.command';
import { BuildStepDataUsecase } from '../build-step-data';
import { GeneratePreviewCommand } from './generate-preview.command';
import { extractTemplateVars } from '../../util/template-variables/extract-template-variables';
import { pathsToObject } from '../../util/path-to-object';

@Injectable()
export class GeneratePreviewUsecase {
  constructor(
    private legacyPreviewStepUseCase: PreviewStep,
    private buildStepDataUsecase: BuildStepDataUsecase,
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase
  ) {}

  async execute(command: GeneratePreviewCommand): Promise<GeneratePreviewResponseDto> {
    const dto = command.generatePreviewRequestDto;
    const stepData = await this.getStepData(command);
    const workflow = await this.findWorkflow(command);

    const variablesExample = this.buildVariablesExample(workflow, stepData, dto);
    const executeOutput = await this.executePreviewUsecase(
      command,
      stepData,
      variablesExample,
      dto.controlValues || {}
    );

    return {
      result: {
        preview: executeOutput.outputs as any,
        type: stepData.type as unknown as ChannelTypeEnum,
      },
      previewPayloadExample: variablesExample,
    } as GeneratePreviewResponseDto;
  }

  private buildVariablesExample(
    workflow: WorkflowInternalResponseDto,
    stepData: StepDataDto,
    dto: GeneratePreviewRequestDto
  ) {
    const variablesExample = this.generateVariablesExample(dto, stepData);

    if (workflow.origin === WorkflowOriginEnum.EXTERNAL) {
      variablesExample.payload = this.generateSamplePayload(workflow.payloadSchema);
    }

    return _.merge(variablesExample, dto.previewPayload as Record<string, unknown>);
  }

  private generateVariablesExample(dto: GeneratePreviewRequestDto, stepData: StepDataDto) {
    const controlValues = Object.values(dto.controlValues || stepData.controls.values).join('');
    const variablesExample = pathsToObject(extractTemplateVars(controlValues), {
      valuePrefix: '{{',
      valueSuffix: '}}',
    });

    return variablesExample;
  }

  private buildPayloadExample(
    workflow: WorkflowInternalResponseDto,
    dto: GeneratePreviewRequestDto,
    stepData: StepDataDto
  ) {
    let payloadVariableExample: Record<string, unknown> = {};
    if (workflow.origin === WorkflowOriginEnum.EXTERNAL) {
      payloadVariableExample = this.generateSamplePayload(workflow.payloadSchema);
    } else {
      const controlValues = Object.values(dto.controlValues || stepData.controls.values).join('');
      payloadVariableExample = pathsToObject(extractTemplateVars(controlValues), {
        valuePrefix: '{{',
        valueSuffix: '}}',
      }).payload as Record<string, unknown>;
    }

    return payloadVariableExample && Object.keys(payloadVariableExample).length > 0
      ? { payload: payloadVariableExample }
      : {};
  }

  private async findWorkflow(command: GeneratePreviewCommand) {
    return await this.getWorkflowByIdsUseCase.execute(
      GetWorkflowByIdsCommand.create({
        identifierOrInternalId: command.identifierOrInternalId,
        environmentId: command.user.environmentId,
        organizationId: command.user.organizationId,
        userId: command.user._id,
      })
    );
  }

  /**
   * Generates a payload based solely on the schema.
   * Supports nested schemas and applies defaults where defined.
   * @param JSONSchemaDto - Defining the structure. example:
   *  {
   *    firstName: { type: 'string', default: 'John' },
   *    lastName: { type: 'string' }
   *  }
   * @returns - Generated payload. example: { firstName: 'John', lastName: '{{payload.lastName}}' }
   */
  private generateSamplePayload(schema: JSONSchemaDto, path = 'payload', depth = 0): Record<string, unknown> {
    const MAX_DEPTH = 10;

    if (Object.values(schema.properties || {}).length === 0) {
      return {};
    }

    if (schema.type !== 'object' || !schema.properties) {
      throw new Error('Schema must define an object with properties.');
    }

    return Object.entries(schema.properties).reduce((acc, [key, definition]) => {
      if (typeof definition === 'boolean') {
        return acc;
      }

      const currentPath = `${path}.${key}`;

      if (definition.default) {
        acc[key] = definition.default;
      } else if (definition.type === 'object' && definition.properties) {
        acc[key] = this.generateSamplePayload(definition, currentPath, depth + 1);
      } else {
        acc[key] = `{{${currentPath}}}`;
      }

      return acc;
    }, {});
  }

  private async getStepData(command: GeneratePreviewCommand) {
    return await this.buildStepDataUsecase.execute({
      identifierOrInternalId: command.identifierOrInternalId,
      stepId: command.stepDatabaseId,
      user: command.user,
    });
  }
  private isFrameworkError(obj: any): obj is FrameworkError {
    return typeof obj === 'object' && obj.status === '400' && obj.name === 'BridgeRequestError';
  }
  private async executePreviewUsecase(
    command: GeneratePreviewCommand,
    stepData: StepDataDto,
    hydratedPayload: PreviewPayload,
    updatedControlValues: Record<string, unknown>
  ) {
    const state = buildState(hydratedPayload.steps);
    try {
      return await this.legacyPreviewStepUseCase.execute(
        PreviewStepCommand.create({
          payload: hydratedPayload.payload || {},
          subscriber: hydratedPayload.subscriber,
          controls: updatedControlValues || {},
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
