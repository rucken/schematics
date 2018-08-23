import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TestEntityDto } from './test-entity.dto';
export class OutTestEntityDto {
  @Type(() => TestEntityDto)
  @ApiModelProperty({ type: TestEntityDto })
  testEntity: TestEntityDto;
}
