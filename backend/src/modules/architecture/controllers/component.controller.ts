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
import { ComponentService } from '../services/component.service';
import {
  CreateArchitectureComponentDto,
  UpdateArchitectureComponentDto,
} from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Architecture Components')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Tạm comment để test Swagger
@Controller('architectures/components')
export class ComponentController {
  constructor(private readonly componentService: ComponentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new architecture component' })
  @ApiResponse({ status: 201, description: 'Component created successfully' })
  @ApiResponse({ status: 404, description: 'Architecture not found' })
  async create(@Body() dto: CreateArchitectureComponentDto) {
    return this.componentService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all components, optionally filtered by architecture',
  })
  @ApiQuery({
    name: 'architecture_id',
    required: false,
    description: 'Filter by architecture ID',
  })
  @ApiResponse({ status: 200, description: 'Return all components' })
  async findAll(@Query('architecture_id') architectureId?: string) {
    return this.componentService.findAll(architectureId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a component by ID' })
  @ApiResponse({ status: 200, description: 'Return the component' })
  @ApiResponse({ status: 404, description: 'Component not found' })
  async findOne(@Param('id') id: string) {
    return this.componentService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a component' })
  @ApiResponse({ status: 200, description: 'Component updated successfully' })
  @ApiResponse({ status: 404, description: 'Component not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateArchitectureComponentDto,
  ) {
    return this.componentService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a component' })
  @ApiResponse({ status: 200, description: 'Component deleted successfully' })
  @ApiResponse({ status: 404, description: 'Component not found' })
  async remove(@Param('id') id: string) {
    await this.componentService.remove(id);
    return { message: 'Component deleted successfully' };
  }
}
