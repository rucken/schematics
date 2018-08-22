import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TestEntityDto } from './test-entity.dto';
import { MetaDto } from '@rucken/core-nestjs';

export class OutTestEntitiesDto {
  @Type(() => TestEntityDto)
  @ApiModelProperty({ type: TestEntityDto, isArray: true })
  testEntities: TestEntityDto[];
  @Type(() => MetaDto)
  @ApiModelProperty({ type: MetaDto })
  meta: MetaDto;
}
