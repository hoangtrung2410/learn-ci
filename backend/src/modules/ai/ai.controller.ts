import { Controller, Post, Body, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { AiService, AIProvider } from './ai.service';
import { AnalyzeLogsDto } from './dto/analyze-logs.dto';
import { PredictFailureDto } from './dto/predict-failure.dto';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('analyze-logs')
    @ApiOperation({
        summary: 'Analyze pipeline logs with AI',
        description: 'Get AI-powered insights and recommendations from pipeline logs',
    })
    @ApiQuery({
        name: 'provider',
        required: false,
        enum: AIProvider,
        description: 'AI provider to use (openai or gemini)',
    })
    @ApiResponse({ status: 200, description: 'Analysis completed successfully' })
    async analyzeLogs(
        @Body() dto: AnalyzeLogsDto,
        @Query('provider') provider?: AIProvider
    ) {
        return this.aiService.analyzePipelineLogs(dto.logs, provider);
    }

    @Post('predict-failure')
    @ApiOperation({
        summary: 'Predict pipeline failure likelihood',
        description: 'Use ML to predict if a pipeline is likely to fail',
    })
    @ApiQuery({
        name: 'provider',
        required: false,
        enum: AIProvider,
        description: 'AI provider to use (openai or gemini)',
    })
    @ApiResponse({ status: 200, description: 'Prediction completed successfully' })
    async predictFailure(
        @Body() dto: PredictFailureDto,
        @Query('provider') provider?: AIProvider
    ) {
        return this.aiService.predictFailure(dto, provider);
    }

    @Post('suggest-fixes')
    @ApiOperation({
        summary: 'Get AI-suggested fixes for errors',
        description: 'Analyze error logs and suggest potential fixes',
    })
    @ApiQuery({
        name: 'provider',
        required: false,
        enum: AIProvider,
        description: 'AI provider to use (openai or gemini)',
    })
    @ApiResponse({ status: 200, description: 'Suggestions generated successfully' })
    async suggestFixes(
        @Body() dto: { errorLogs: string[] },
        @Query('provider') provider?: AIProvider
    ) {
        return this.aiService.suggestFixes(dto.errorLogs, provider);
    }

    @Get('optimize/:projectId')
    @ApiOperation({
        summary: 'Get AI optimization recommendations',
        description: 'Generate optimization recommendations based on project metrics',
    })
    @ApiParam({ name: 'projectId', description: 'Project UUID' })
    @ApiQuery({
        name: 'provider',
        required: false,
        enum: AIProvider,
        description: 'AI provider to use (openai or gemini)',
    })
    @ApiResponse({ status: 200, description: 'Recommendations generated successfully' })
    async getOptimizations(
        @Param('projectId', ParseUUIDPipe) projectId: string,
        @Query('provider') provider?: AIProvider
    ) {
        // TODO: Fetch project metrics and generate recommendations
        return { recommendations: [] };
    }
}
