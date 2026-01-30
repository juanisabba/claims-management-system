import { ClaimStatus } from '../../domain/value-objects/claim-status.enum';

export class ClaimSummaryDto {
  id: string;
  title: string;
  description: string;
  status: ClaimStatus;
  totalAmount: number;
}
