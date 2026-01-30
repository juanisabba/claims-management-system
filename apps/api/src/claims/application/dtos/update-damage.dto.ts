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
import { SeverityEnum } from 'src/claims/domain/value-objects/severity.enum';

export class UpdateDamageDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  part?: string;

  @IsOptional()
  @IsEnum(SeverityEnum, {
    message: 'Severity must be: low, mid, or high',
  })
  severity?: SeverityEnum;

  @IsOptional()
  @IsUrl()
  @IsNotEmpty()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  price?: number;
}
