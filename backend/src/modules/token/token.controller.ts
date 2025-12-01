import { Controller, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TokenService } from './token.service';
import { PaginationDto } from '../../database/dto/pagination.dto';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { Get, Post, Put, Delete, Param, Body } from '@nestjs/common';

@Controller('tokens')
@ApiTags('tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  getAllTokens(@Query() data: PaginationDto) {
    return this.tokenService.getAll(data);
  }

  @Get(':id')
  getTokenDetail(@Param('id') id: string) {
    return this.tokenService.getDetail(id);
  }

  @Post()
  createToken(@Body() data: CreateTokenDto) {
    return this.tokenService.create(data);
  }

  @Put(':id')
  updateToken(@Param('id') id: string, @Body() data: UpdateTokenDto) {
    return this.tokenService.update(id, data);
  }

  @Delete(':id')
  deleteToken(@Param('id') id: string) {
    return this.tokenService.delete(id);
  }
}
