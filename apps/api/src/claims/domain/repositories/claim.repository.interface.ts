import { Claim } from '../entities/claim.entity';
import { ClaimStatus } from '../value-objects/claim-status.enum';

export interface ClaimFilters {
  status?: ClaimStatus;
  clientId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface ClaimSummary {
  id: string;
  title: string;
  description: string;
  status: ClaimStatus;
  totalAmount: number;
}

export interface IClaimRepository {
  save(claim: Claim): Promise<void>;
  findById(id: string): Promise<Claim | null>;
  findAll(filters: ClaimFilters): Promise<PaginatedResult<ClaimSummary>>;
  update(claim: Claim): Promise<void>;
  delete(id: string): Promise<void>;
}
