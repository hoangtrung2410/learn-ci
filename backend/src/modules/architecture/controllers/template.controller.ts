import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TemplateService } from '../services/template.service';
import {
  CreatePipelineTemplateDto,
  UpdatePipelineTemplateDto,
  CreateArchitectureTemplateMapDto,
} from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Pipeline Templates')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Tạm comment để test Swagger
@Controller('architectures/templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pipeline template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async create(@Body() dto: CreatePipelineTemplateDto) {
    return this.templateService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all templates with optional filters' })
  @ApiQuery({
    name: 'platform',
    required: false,
    description: 'Filter by platform',
  })
  @ApiQuery({
    name: 'is_published',
    required: false,
    description: 'Filter by published status',
  })
  @ApiQuery({
    name: 'is_verified',
    required: false,
    description: 'Filter by verified status',
  })
  @ApiResponse({ status: 200, description: 'Return all templates' })
  async findAll(
    @Query('platform') platform?: string,
    @Query('is_published') isPublished?: string,
    @Query('is_verified') isVerified?: string,
  ) {
    const filters: any = {};
    if (platform) filters.platform = platform;
    if (isPublished) filters.is_published = isPublished === 'true';
    if (isVerified) filters.is_verified = isVerified === 'true';

    return this.templateService.findAll(filters);
  }

  @Get('architecture/:architectureId')
  @ApiOperation({ summary: 'Get templates recommended for an architecture' })
  @ApiResponse({
    status: 200,
    description: 'Return templates for architecture',
  })
  async getTemplatesForArchitecture(
    @Param('architectureId') architectureId: string,
  ) {
    return this.templateService.getTemplatesForArchitecture(architectureId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a template by ID' })
  @ApiResponse({ status: 200, description: 'Return the template' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findOne(@Param('id') id: string) {
    return this.templateService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePipelineTemplateDto,
  ) {
    return this.templateService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a template' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async remove(@Param('id') id: string) {
    await this.templateService.remove(id);
    return { message: 'Template deleted successfully' };
  }

  @Post(':id/increment-usage')
  @ApiOperation({ summary: 'Increment template usage count' })
  @ApiResponse({ status: 200, description: 'Usage count incremented' })
  async incrementUsage(@Param('id') id: string) {
    await this.templateService.incrementUsage(id);
    return { message: 'Usage count incremented' };
  }

  @Post('map')
  @ApiOperation({ summary: 'Map a template to an architecture' })
  @ApiResponse({ status: 201, description: 'Template mapped successfully' })
  async mapToArchitecture(@Body() dto: CreateArchitectureTemplateMapDto) {
    return this.templateService.mapToArchitecture(dto);
  }

  @Delete('map/:architectureId/:templateId')
  @ApiOperation({ summary: 'Remove template mapping from architecture' })
  @ApiResponse({ status: 200, description: 'Mapping removed successfully' })
  async unmapFromArchitecture(
    @Param('architectureId') architectureId: string,
    @Param('templateId') templateId: string,
  ) {
    await this.templateService.unmapFromArchitecture(
      architectureId,
      templateId,
    );
    return { message: 'Mapping removed successfully' };
  }
}
