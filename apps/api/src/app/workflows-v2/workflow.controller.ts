import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common/decorators';
import { ClassSerializerInterceptor, HttpStatus, Patch } from '@nestjs/common';
import {
  CreateWorkflowDto,
  DirectionEnum,
  GeneratePreviewRequestDto,
  GeneratePreviewResponseDto,
  GetListQueryParams,
  ListWorkflowResponse,
  PatchStepDataDto,
  PatchWorkflowDto,
  StepDataDto,
  SyncWorkflowDto,
  UpdateWorkflowDto,
  UserSessionData,
  WorkflowOriginEnum,
  WorkflowResponseDto,
  WorkflowTestDataResponseDto,
} from '@novu/shared';
import { DeleteWorkflowCommand, DeleteWorkflowUseCase, UserAuthGuard, UserSession } from '@novu/application-generic';
import { IsString } from 'class-validator';
import { ApiCommonResponses } from '../shared/framework/response.decorator';
import { UserAuthentication } from '../shared/framework/swagger/api.key.security';
import { GetWorkflowCommand } from './usecases/get-workflow/get-workflow.command';
import { UpsertWorkflowUseCase } from './usecases/upsert-workflow/upsert-workflow.usecase';
import { UpsertWorkflowCommand } from './usecases/upsert-workflow/upsert-workflow.command';
import { GetWorkflowUseCase } from './usecases/get-workflow/get-workflow.usecase';
import { ListWorkflowsUseCase } from './usecases/list-workflows/list-workflow.usecase';
import { ListWorkflowsCommand } from './usecases/list-workflows/list-workflows.command';
import { SyncToEnvironmentUseCase } from './usecases/sync-to-environment/sync-to-environment.usecase';
import { SyncToEnvironmentCommand } from './usecases/sync-to-environment/sync-to-environment.command';
import { GeneratePreviewUsecase } from './usecases/generate-preview/generate-preview.usecase';
import { ParseSlugIdPipe } from './pipes/parse-slug-id.pipe';
import { ParseSlugEnvironmentIdPipe } from './pipes/parse-slug-env-id.pipe';
import {
  BuildStepDataCommand,
  BuildStepDataUsecase,
  BuildWorkflowTestDataUseCase,
  WorkflowTestDataCommand,
} from './usecases';
import { GeneratePreviewCommand } from './usecases/generate-preview/generate-preview.command';
import { PatchStepCommand } from './usecases/patch-step-data';
import { PatchWorkflowCommand, PatchWorkflowUsecase } from './usecases/patch-workflow';
import { PatchStepUsecase } from './usecases/patch-step-data/patch-step.usecase';
import {
  GenerateSuggestionsCommand,
  GenerateSuggestionsUsecase,
  WorkflowModeEnum,
} from './usecases/generate-suggestions';

class GenerateWorkflowSuggestionsDto {
  @IsString()
  prompt: string;

  @IsString()
  mode?: WorkflowModeEnum;
}

@ApiCommonResponses()
@Controller({ path: `/workflows`, version: '2' })
@UseInterceptors(ClassSerializerInterceptor)
@UserAuthentication()
@ApiTags('Workflows')
export class WorkflowController {
  constructor(
    private upsertWorkflowUseCase: UpsertWorkflowUseCase,
    private getWorkflowUseCase: GetWorkflowUseCase,
    private listWorkflowsUseCase: ListWorkflowsUseCase,
    private deleteWorkflowUsecase: DeleteWorkflowUseCase,
    private syncToEnvironmentUseCase: SyncToEnvironmentUseCase,
    private generatePreviewUseCase: GeneratePreviewUsecase,
    private buildWorkflowTestDataUseCase: BuildWorkflowTestDataUseCase,
    private buildStepDataUsecase: BuildStepDataUsecase,
    private patchStepDataUsecase: PatchStepUsecase,
    private patchWorkflowUsecase: PatchWorkflowUsecase,
    private generateSuggestionsUsecase: GenerateSuggestionsUsecase
  ) {}

  @Post('/suggestions')
  @UseGuards(UserAuthGuard)
  @ApiExcludeEndpoint()
  async generateSuggestions(
    @UserSession() user: UserSessionData,
    @Body() body: GenerateWorkflowSuggestionsDto
  ): Promise<any> {
    return this.generateSuggestionsUsecase.execute(
      GenerateSuggestionsCommand.create({
        prompt: body.prompt,
        environmentId: user.environmentId,
        organizationId: user.organizationId,
        userId: user._id,
        mode: body.mode || WorkflowModeEnum.MULTIPLE,
      })
    );
  }

  @Post('')
  @UseGuards(UserAuthGuard)
  async create(
    @UserSession(ParseSlugEnvironmentIdPipe) user: UserSessionData,
    @Body() createWorkflowDto: CreateWorkflowDto
  ): Promise<WorkflowResponseDto> {
    return this.upsertWorkflowUseCase.execute(
      UpsertWorkflowCommand.create({
        workflowDto: { ...createWorkflowDto, origin: WorkflowOriginEnum.NOVU_CLOUD },
        user,
      })
    );
  }

  @Put(':workflowId/sync')
  @UseGuards(UserAuthGuard)
  async sync(
    @UserSession() user: UserSessionData,
    @Param('workflowId', ParseSlugIdPipe) workflowIdOrInternalId: string,
    @Body() syncWorkflowDto: SyncWorkflowDto
  ): Promise<WorkflowResponseDto> {
    return this.syncToEnvironmentUseCase.execute(
      SyncToEnvironmentCommand.create({
        user,
        workflowIdOrInternalId,
        targetEnvironmentId: syncWorkflowDto.targetEnvironmentId,
      })
    );
  }

  @Put(':workflowId')
  @UseGuards(UserAuthGuard)
  async update(
    @UserSession(ParseSlugEnvironmentIdPipe) user: UserSessionData,
    @Param('workflowId', ParseSlugIdPipe) workflowIdOrInternalId: string,
    @Body() updateWorkflowDto: UpdateWorkflowDto
  ): Promise<WorkflowResponseDto> {
    return await this.upsertWorkflowUseCase.execute(
      UpsertWorkflowCommand.create({
        workflowDto: { ...updateWorkflowDto },
        user,
        workflowIdOrInternalId,
      })
    );
  }

  @Get(':workflowId')
  @UseGuards(UserAuthGuard)
  async getWorkflow(
    @UserSession(ParseSlugEnvironmentIdPipe) user: UserSessionData,
    @Param('workflowId', ParseSlugIdPipe) workflowIdOrInternalId: string,
    @Query('environmentId') environmentId?: string
  ): Promise<WorkflowResponseDto> {
    return this.getWorkflowUseCase.execute(
      GetWorkflowCommand.create({
        workflowIdOrInternalId,
        user: {
          ...user,
          environmentId: environmentId || user.environmentId,
        },
      })
    );
  }

  @Delete(':workflowId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeWorkflow(
    @UserSession(ParseSlugEnvironmentIdPipe) user: UserSessionData,
    @Param('workflowId', ParseSlugIdPipe) workflowIdOrInternalId: string
  ) {
    await this.deleteWorkflowUsecase.execute(
      DeleteWorkflowCommand.create({
        workflowIdOrInternalId,
        environmentId: user.environmentId,
        organizationId: user.organizationId,
        userId: user._id,
      })
    );
  }

  @Get('')
  @UseGuards(UserAuthGuard)
  async searchWorkflows(
    @UserSession(ParseSlugEnvironmentIdPipe) user: UserSessionData,
    @Query() query: GetListQueryParams
  ): Promise<ListWorkflowResponse> {
    return this.listWorkflowsUseCase.execute(
      ListWorkflowsCommand.create({
        offset: Number(query.offset || '0'),
        limit: Number(query.limit || '50'),
        orderDirection: query.orderDirection ?? DirectionEnum.DESC,
        orderByField: query.orderByField ?? 'createdAt',
        searchQuery: query.query,
        user,
      })
    );
  }

  @Post('/:workflowId/step/:stepId/preview')
  @UseGuards(UserAuthGuard)
  async generatePreview(
    @UserSession(ParseSlugEnvironmentIdPipe) user: UserSessionData,
    @Param('workflowId', ParseSlugIdPipe) workflowIdOrInternalId: string,
    @Param('stepId', ParseSlugIdPipe) stepIdOrInternalId: string,
    @Body() generatePreviewRequestDto: GeneratePreviewRequestDto
  ): Promise<GeneratePreviewResponseDto> {
    return await this.generatePreviewUseCase.execute(
      GeneratePreviewCommand.create({
        user,
        workflowIdOrInternalId,
        stepIdOrInternalId,
        generatePreviewRequestDto,
      })
    );
  }

  @Get('/:workflowId/steps/:stepId')
  @UseGuards(UserAuthGuard)
  async getWorkflowStepData(
    @UserSession(ParseSlugEnvironmentIdPipe) user: UserSessionData,
    @Param('workflowId', ParseSlugIdPipe) workflowIdOrInternalId: string,
    @Param('stepId', ParseSlugIdPipe) stepIdOrInternalId: string
  ): Promise<StepDataDto> {
    return await this.buildStepDataUsecase.execute(
      BuildStepDataCommand.create({ user, workflowIdOrInternalId, stepIdOrInternalId })
    );
  }

  @Patch('/:workflowId/steps/:stepId')
  @UseGuards(UserAuthGuard)
  async patchWorkflowStepData(
    @UserSession(ParseSlugEnvironmentIdPipe) user: UserSessionData,
    @Param('workflowId', ParseSlugIdPipe) workflowIdOrInternalId: string,
    @Param('stepId', ParseSlugIdPipe) stepIdOrInternalId: string,
    @Body() patchStepDataDto: PatchStepDataDto
  ): Promise<StepDataDto> {
    return await this.patchStepDataUsecase.execute(
      PatchStepCommand.create({
        user,
        workflowIdOrInternalId,
        stepIdOrInternalId,
        ...patchStepDataDto,
      })
    );
  }

  @Patch('/:workflowId')
  @UseGuards(UserAuthGuard)
  async patchWorkflow(
    @UserSession(ParseSlugEnvironmentIdPipe) user: UserSessionData,
    @Param('workflowId', ParseSlugIdPipe) workflowIdOrInternalId: string,
    @Body() patchWorkflowDto: PatchWorkflowDto
  ): Promise<WorkflowResponseDto> {
    return await this.patchWorkflowUsecase.execute(
      PatchWorkflowCommand.create({ user, workflowIdOrInternalId, ...patchWorkflowDto })
    );
  }

  @Get('/:workflowId/test-data')
  @UseGuards(UserAuthGuard)
  async getWorkflowTestData(
    @UserSession() user: UserSessionData,
    @Param('workflowId', ParseSlugIdPipe) workflowIdOrInternalId: string
  ): Promise<WorkflowTestDataResponseDto> {
    return this.buildWorkflowTestDataUseCase.execute(
      WorkflowTestDataCommand.create({
        workflowIdOrInternalId,
        user,
      })
    );
  }
}
