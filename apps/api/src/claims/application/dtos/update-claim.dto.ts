import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ClaimStatus } from '../../domain/value-objects/claim-status.enum';

export class UpdateClaimDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;
}
