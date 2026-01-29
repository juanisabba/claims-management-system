import { Claim } from '../../../domain/entities/claim.entity';
import { Damage } from '../../../domain/entities/damage.entity';
import { ClaimStatus } from '../../../domain/value-objects/claim-status.enum';
import { SeverityEnum } from '../../../domain/value-objects/severity.enum';

interface RawDamage {
  _id: string;
  part: string;
  severity: string;
  imageUrl: string;
  price: number;
}

export interface RawClaim {
  _id: string;
  title: string;
  description: string;
  status: string;
  damages: RawDamage[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ClaimMapper {
  static toDomain(raw: RawClaim): Claim {
    const damages = (raw.damages || []).map(
      (damage: RawDamage) =>
        new Damage(
          damage._id,
          damage.part,
          damage.severity as SeverityEnum,
          damage.imageUrl,
          damage.price,
        ),
    );

    return new Claim(
      raw._id,
      raw.title,
      raw.description,
      raw.status as ClaimStatus,
      damages,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  static toPersistence(claim: Claim): RawClaim {
    const damages = claim.damages.map((damage) => ({
      _id: damage.id,
      part: damage.part,
      severity: damage.severity,
      imageUrl: damage.imageUrl,
      price: damage.price,
    }));

    return {
      _id: claim.id,
      title: claim.title,
      description: claim.description,
      status: claim.status,
      damages: damages,
      totalAmount: claim.totalAmount,
      createdAt: claim.createdAt,
      updatedAt: claim.updatedAt,
    };
  }

  static toResponse(claim: Claim) {
    return {
      id: claim.id,
      title: claim.title,
      description: claim.description,
      status: claim.status,
      totalAmount: claim.totalAmount,
      damages: claim.damages.map((damage) => ({
        id: damage.id,
        part: damage.part,
        severity: damage.severity,
        imageUrl: damage.imageUrl,
        price: damage.price,
      })),
      createdAt: claim.createdAt,
      updatedAt: claim.updatedAt,
    };
  }
}
