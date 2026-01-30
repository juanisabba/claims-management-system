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
import { SeverityEnum } from 'src/claims/domain/value-objects/severity.enum';

export class AddDamageDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  part: string;

  @IsEnum(SeverityEnum, {
    message: 'Severity must be: low, mid, or high',
  })
  severity: SeverityEnum;

  @IsUrl()
  @IsNotEmpty()
  imageUrl: string;

  @IsNumber()
  @Min(0.01)
  price: number;
}
