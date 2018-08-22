import { ApiModelProperty } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';

export class InTestEntityDto {  
  @IsOptional()
  id: number;
  @ApiModelProperty()
  @MaxLength(100)
  name: string;

}
