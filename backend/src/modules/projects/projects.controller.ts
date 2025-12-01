import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto } from '../../database/dto/pagination.dto';

@Controller('projects')
@ApiTags('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  getAll(@Query() data: PaginationDto) {
    return this.projectsService.getAll(data);
  }

  @Get(':id')
  getDetail(@Param('id') id: string) {
    return this.projectsService.getDetail(id);
  }

  @Post()
  create(@Body() data: CreateProjectDto) {
    return this.projectsService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateProjectDto) {
    return this.projectsService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }
}
