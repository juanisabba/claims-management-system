import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsUrl,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SeverityEnum } from 'src/claims/domain/value-objects/severity.enum';

export class AddDamageDto {
  @ApiProperty({
    description: 'The part of the vehicle that is damaged',
    example: 'Front bumper',
    minLength: 1,
    maxLength: 200,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  part: string;

  @ApiProperty({
    description: 'The severity of the damage',
    enum: SeverityEnum,
    example: SeverityEnum.MID,
  })
  @IsEnum(SeverityEnum, {
    message: 'Severity must be: low, mid, or high',
  })
  severity: SeverityEnum;

  @ApiProperty({
    description: 'URL of the image showing the damage',
    example: 'https://example.com/damage.jpg',
  })
  @IsUrl()
  @IsNotEmpty()
  imageUrl: string;

  @ApiProperty({
    description: 'Estimated repair price',
    example: 500.0,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  price: number;
}
