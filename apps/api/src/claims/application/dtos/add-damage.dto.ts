import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsUrl,
  Min,
  MaxLength,
} from 'class-validator';
import { SeverityEnum } from 'src/claims/domain/value-objects/severity.enum';

export class AddDamageDto {
  @IsString()
  @IsNotEmpty()
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
