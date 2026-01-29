import { Claim } from '../../../domain/entities/claim.entity';
import { Damage } from '../../../domain/entities/damage.entity';
import { ClaimStatus } from '../../../domain/value-objects/claim-status.enum';
import { Severity } from '../../../domain/value-objects/severity.vo';

interface RawDamage {
  _id: string;
  part: string;
  description: string;
  severity: string;
  imageUrl: string;
  price: number;
}

interface RawClaim {
  _id: string;
  title: string;
  description: string;
  status: string;
  damages: RawDamage[];
  totalAmount: number;
}

export class ClaimMapper {
  static toDomain(raw: RawClaim): Claim {
    const damages = (raw.damages || []).map(
      (damage: RawDamage) =>
        new Damage(
          damage._id,
          damage.part,
          damage.description,
          Severity.create(damage.severity),
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
    );
  }

  static toPersistence(claim: Claim): RawClaim {
    const damages = claim.damages.map((damage) => ({
      _id: damage.id,
      part: damage.part,
      description: damage.description,
      severity: damage.severity.value,
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
    };
  }
}
