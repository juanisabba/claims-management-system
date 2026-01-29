import { ClaimStatus } from './claim-status.enum';

export enum Severity {
  LOW = 'low',
  MID = 'mid',
  HIGH = 'high',
}

export interface Damage {
  id: string;
  part: string;
  severity: Severity;
  imageUrl: string;
  price: number;
}

export interface Claim {
  id: string;
  title: string;
  description: string;
  status: ClaimStatus;
  damages: Damage[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}
