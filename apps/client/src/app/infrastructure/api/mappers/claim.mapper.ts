import { Claim, ClaimSummary, Damage, Severity } from '../../../core/models/claim.model';
import { ClaimStatus } from '../../../core/models/claim-status.enum';

export interface DamageApiResponse {
  id: string;
  part: string;
  severity: Severity;
  imageUrl: string;
  price: number;
}

export interface ClaimApiResponse {
  id: string;
  title: string;
  description: string;
  status: ClaimStatus;
  damages?: DamageApiResponse[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimSummaryApiResponse {
  id: string;
  title: string;
  description: string;
  status: ClaimStatus;
  totalAmount: number;
}

export class ClaimMapper {
  static fromSummaryApi(data: ClaimSummaryApiResponse): ClaimSummary {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      totalAmount: data.totalAmount,
    };
  }

  static fromApi(data: ClaimApiResponse): Claim {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      damages: (data.damages || []).map((d) => ({
        id: d.id,
        part: d.part,
        severity: d.severity,
        imageUrl: d.imageUrl,
        price: d.price,
      })),
      totalAmount: data.totalAmount || 0,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }
}
