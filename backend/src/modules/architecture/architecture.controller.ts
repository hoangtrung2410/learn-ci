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
} from '@nestjs/swagger';
import { ArchitectureService } from './architecture.service';
import {
  CreateDeploymentArchitectureDto,
  UpdateDeploymentArchitectureDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Architectures')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Tạm comment để test Swagger
@Controller('architectures')
export class ArchitectureController {
  constructor(private readonly architectureService: ArchitectureService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new deployment architecture' })
  @ApiResponse({
    status: 201,
    description: 'Architecture created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Architecture with this key already exists',
  })
  async create(@Body() dto: CreateDeploymentArchitectureDto) {
    return this.architectureService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all deployment architectures' })
  @ApiResponse({ status: 200, description: 'Return all architectures' })
  async findAll() {
    return this.architectureService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an architecture by ID' })
  @ApiResponse({ status: 200, description: 'Return the architecture' })
  @ApiResponse({ status: 404, description: 'Architecture not found' })
  async findOne(@Param('id') id: string) {
    return this.architectureService.findOne(id);
  }

  @Get('key/:key')
  @ApiOperation({ summary: 'Get an architecture by key' })
  @ApiResponse({ status: 200, description: 'Return the architecture' })
  @ApiResponse({ status: 404, description: 'Architecture not found' })
  async findByKey(@Param('key') key: string) {
    return this.architectureService.findByKey(key);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an architecture' })
  @ApiResponse({
    status: 200,
    description: 'Architecture updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Architecture not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDeploymentArchitectureDto,
  ) {
    return this.architectureService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an architecture' })
  @ApiResponse({
    status: 200,
    description: 'Architecture deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Architecture not found' })
  async remove(@Param('id') id: string) {
    await this.architectureService.remove(id);
    return { message: 'Architecture deleted successfully' };
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get architecture statistics' })
  @ApiResponse({ status: 200, description: 'Return architecture statistics' })
  @ApiResponse({ status: 404, description: 'Architecture not found' })
  async getStatistics(@Param('id') id: string) {
    return this.architectureService.getStatistics(id);
  }
}
