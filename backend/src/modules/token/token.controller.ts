import { Controller, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TokenService } from './token.service';
import { PaginationDto } from '../../database/dto/pagination.dto';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { Get, Post, Put, Delete, Param, Body } from '@nestjs/common';

@Controller('tokens')
@ApiTags('Tokens')
@ApiBearerAuth()
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all tokens',
    description: 'Retrieve a paginated list of all Git provider tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'List of tokens retrieved successfully',
  })
  getAllTokens(@Query() data: PaginationDto) {
    return this.tokenService.getAll(data);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get token details',
    description: 'Retrieve detailed information about a specific token',
  })
  @ApiParam({ name: 'id', description: 'Token UUID' })
  @ApiResponse({ status: 200, description: 'Token details retrieved' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  getTokenDetail(@Param('id') id: string) {
    return this.tokenService.getDetail(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create new token',
    description: 'Create a new Git provider access token (GitHub/GitLab)',
  })
  @ApiBody({ type: CreateTokenDto })
  @ApiResponse({ status: 201, description: 'Token created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token data' })
  createToken(@Body() data: CreateTokenDto) {
    return this.tokenService.create(data);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update token',
    description: 'Update an existing token',
  })
  @ApiParam({ name: 'id', description: 'Token UUID' })
  @ApiBody({ type: UpdateTokenDto })
  @ApiResponse({ status: 200, description: 'Token updated successfully' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  updateToken(@Param('id') id: string, @Body() data: UpdateTokenDto) {
    return this.tokenService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete token',
    description: 'Delete a token permanently',
  })
  @ApiParam({ name: 'id', description: 'Token UUID' })
  @ApiResponse({ status: 200, description: 'Token deleted successfully' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  deleteToken(@Param('id') id: string) {
    return this.tokenService.delete(id);
  }
}
