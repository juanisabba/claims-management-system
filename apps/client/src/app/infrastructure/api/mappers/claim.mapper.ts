import { Claim } from '../../../core/models/claim.model';

export class ClaimMapper {
  static fromApi(data: any): Claim {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      damages: data.damages || [],
      totalAmount: data.totalAmount || 0,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }
}
