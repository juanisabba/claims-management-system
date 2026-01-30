import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AddDamageDto } from './add-damage.dto';

export class CreateClaimDto {
  @ApiProperty({
    description: 'The title of the claim',
    example: 'Car accident in downtown',
    minLength: 1,
    maxLength: 200,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'A detailed description of the claim',
    example: 'A collision occurred at the intersection of Main and 5th.',
    minLength: 1,
    maxLength: 2000,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  description: string;

  @ApiProperty({
    description: 'List of damages associated with the claim',
    type: [AddDamageDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddDamageDto)
  damages?: AddDamageDto[];
}
