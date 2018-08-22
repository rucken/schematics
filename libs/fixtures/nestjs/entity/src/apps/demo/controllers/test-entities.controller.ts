import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiImplicitParam,
  ApiImplicitQuery,
  ApiResponse,
  ApiUseTags
} from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { Permissions } from '@rucken/core-nestjs';
import { Roles } from '@rucken/core-nestjs';
import { InTestEntityDto } from '../dto/in-test-entity.dto';
import { OutTestEntityDto } from '../dto/out-test-entity.dto';
import { OutTestEntitiesDto } from '../dto/out-test-entities.dto';
import { TestEntity } from '../entities/test-entity.entity';
import { AccessGuard } from '@rucken/core-nestjs';
import { ParseIntWithDefaultPipe } from '@rucken/core-nestjs';
import { TestEntitiesService } from '../services/test-entities.service';

@ApiUseTags('test-entities')
@ApiBearerAuth()
@Controller('/api/test_entities')
@UseGuards(AccessGuard)
export class TestEntitiesController {
  constructor(private readonly service: TestEntitiesService) {}
  @Roles('isSuperuser')
  @Permissions('add_test-entity')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: OutTestEntityDto,
    description: 'The record has been successfully created.'
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  @Post()
  async create(@Body() dto: InTestEntityDto) {
    try {
      return plainToClass(
        OutTestEntityDto,
        await this.service.create({
          item: plainToClass(TestEntity, dto)
        })
      );
    } catch (error) {
      throw error;
    }
  }
  @Roles('isSuperuser')
  @Permissions('change_test-entity')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: OutTestEntityDto,
    description: 'The record has been successfully updated.'
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  @ApiImplicitParam({ name: 'id', type: Number })
  @Put(':id')
  async update(
    @Param('id', new ParseIntPipe()) id,
    @Body() dto: InTestEntityDto
  ) {
    try {
      return plainToClass(
        OutTestEntityDto,
        await this.service.update({
          id,
          item: plainToClass(TestEntity, dto)
        })
      );
    } catch (error) {
      throw error;
    }
  }
  @Roles('isSuperuser')
  @Permissions('delete_test-entity')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The record has been successfully deleted.'
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  @ApiImplicitParam({ name: 'id', type: Number })
  @Delete(':id')
  async delete(@Param('id', new ParseIntPipe()) id) {
    try {
      return plainToClass(
        OutTestEntityDto,
        await this.service.delete({
          id
        })
      );
    } catch (error) {
      throw error;
    }
  }
  @Roles('isSuperuser')
  @Permissions('read_test-entity')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: OutTestEntityDto,
    description: ''
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  @ApiImplicitParam({ name: 'id', type: Number })
  @Get(':id')
  async findById(@Param('id', new ParseIntPipe()) id) {
    try {
      return plainToClass(
        OutTestEntityDto,
        await this.service.findById({
          id
        })
      );
    } catch (error) {
      throw error;
    }
  }
  @Roles('isSuperuser')
  @Permissions('read_test-entity')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: OutTestEntitiesDto,
    description: ''
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
  @ApiImplicitQuery({
    name: 'q',
    required: false,
    type: String,
    description: 'Text for search (default: empty)'
  })
  @ApiImplicitQuery({
    name: 'sort',
    required: false,
    type: String,
    description: 'Column name for sort (default: -id)'
  })
  @ApiImplicitQuery({
    name: 'per_page',
    required: false,
    type: Number,
    description: 'Number of results to return per page. (default: 10)'
  })
  @ApiImplicitQuery({
    name: 'cur_page',
    required: false,
    type: Number,
    description: 'A page number within the paginated result set. (default: 1)'
  })
  @Get()
  async findAll(
    @Query('cur_page', new ParseIntWithDefaultPipe(1)) curPage,
    @Query('per_page', new ParseIntWithDefaultPipe(10)) perPage,
    @Query('q') q,
    @Query('sort') sort
  ) {
    try {
      return plainToClass(
        OutTestEntitiesDto,
        await this.service.findAll({
          curPage,
          perPage,
          q,
          sort
        })
      );
    } catch (error) {
      throw error;
    }
  }
}
