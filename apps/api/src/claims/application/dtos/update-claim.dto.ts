import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ClaimStatus } from '../../domain/value-objects/claim-status.enum';

export class UpdateClaimDto {
  @ApiProperty({
    description: 'The updated title of the claim',
    example: 'Car accident in downtown - Updated',
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
  title?: string;

  @ApiProperty({
    description: 'The updated description of the claim',
    example: 'Corrected collision location: Main and 6th.',
    required: false,
    minLength: 1,
    maxLength: 2000,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    description: 'The updated status of the claim',
    enum: ClaimStatus,
    required: false,
    example: ClaimStatus.InReview,
  })
  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;
}
