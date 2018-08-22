import { MaxLength } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class TestEntityDto {  
  @ApiModelProperty({ type: Number })
  id: number;
  @ApiModelProperty()
  @MaxLength(100)
  name: string;

}
