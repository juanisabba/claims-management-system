import { ApiProperty } from '@nestjs/swagger';
import { ClaimStatus } from '../../domain/value-objects/claim-status.enum';

export class ClaimSummaryDto {
  @ApiProperty({
    description: 'The unique identifier of the claim',
    example: '60d0fe4f5311236168a109ca',
  })
  id: string;

  @ApiProperty({
    description: 'The title of the claim',
    example: 'Car accident in downtown',
  })
  title: string;

  @ApiProperty({
    description: 'A detailed description of the claim',
    example: 'A collision occurred at the intersection of Main and 5th.',
  })
  description: string;

  @ApiProperty({
    description: 'The current status of the claim',
    enum: ClaimStatus,
    example: ClaimStatus.Pending,
  })
  status: ClaimStatus;

  @ApiProperty({
    description: 'Total estimated repair amount for all damages',
    example: 1250.5,
  })
  totalAmount: number;
}
