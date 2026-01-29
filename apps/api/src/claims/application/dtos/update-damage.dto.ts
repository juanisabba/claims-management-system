import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsUrl,
  Min,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { SeverityEnum } from 'src/claims/domain/value-objects/severity.enum';

export class UpdateDamageDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
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
