import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsUrl,
  Min,
  MaxLength,
  IsOptional,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SeverityEnum } from 'src/claims/domain/value-objects/severity.enum';

export class UpdateDamageDto {
  @ApiProperty({
    description: 'The updated part of the vehicle that is damaged',
    example: 'Rear bumper',
    required: false,
    minLength: 1,
    maxLength: 200,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  part?: string;

  @ApiProperty({
    description: 'The updated severity of the damage',
    enum: SeverityEnum,
    required: false,
    example: SeverityEnum.LOW,
  })
  @IsOptional()
  @IsEnum(SeverityEnum, {
    message: 'Severity must be: low, mid, or high',
  })
  severity?: SeverityEnum;

  @ApiProperty({
    description: 'Updated URL of the image showing the damage',
    example: 'https://example.com/damage-updated.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  @IsNotEmpty()
  imageUrl?: string;

  @ApiProperty({
    description: 'Updated estimated repair price',
    example: 450.0,
    required: false,
    minimum: 0.01,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  price?: number;
}
