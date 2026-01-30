import { ClaimMapper, RawClaim } from './claim.mapper';
import { Claim } from '../../../domain/entities/claim.entity';
import { Damage } from '../../../domain/entities/damage.entity';
import { ClaimStatus } from '../../../domain/value-objects/claim-status.enum';
import { SeverityEnum } from '../../../domain/value-objects/severity.enum';

describe('ClaimMapper', () => {
  const now = new Date();

  const rawDamage = {
    _id: 'd1',
    part: 'door',
    severity: 'high',
    imageUrl: 'http://test.com/img.jpg',
    price: 500,
  };

  const rawClaim: RawClaim = {
    _id: 'c1',
    title: 'Broken Door',
    description: 'The door is completely broken',
    status: 'Pending',
    damages: [rawDamage],
    totalAmount: 500,
    createdAt: now,
    updatedAt: now,
  };

  const damageEntity = new Damage(
    'd1',
    'door',
    SeverityEnum.HIGH,
    'http://test.com/img.jpg',
    500,
  );
  const claimEntity = new Claim(
    'c1',
    'Broken Door',
    'The door is completely broken',
    ClaimStatus.Pending,
    [damageEntity],
    now,
    now,
  );

  describe('toDomain', () => {
    it('should map RawClaim to Claim entity', () => {
      const result = ClaimMapper.toDomain(rawClaim);

      expect(result).toBeInstanceOf(Claim);
      expect(result.id).toBe(rawClaim._id);
      expect(result.title).toBe(rawClaim.title);
      expect(result.description).toBe(rawClaim.description);
      expect(result.status).toBe(ClaimStatus.Pending);
      expect(result.damages).toHaveLength(1);
      expect(result.damages[0].id).toBe(rawDamage._id);
      expect(result.totalAmount).toBe(500);
    });

    it('should map RawClaim without damages to Claim entity', () => {
      const rawWithoutDamages: RawClaim = {
        ...rawClaim,
        damages: [],
        totalAmount: 0,
      };

      const result = ClaimMapper.toDomain(rawWithoutDamages);

      expect(result.damages).toHaveLength(0);
      expect(result.totalAmount).toBe(0);
    });

    it('should handle null/undefined damages in RawClaim', () => {
      const rawWithNullDamages = {
        ...rawClaim,
        damages: null as unknown as undefined,
      };
      const result = ClaimMapper.toDomain(rawWithNullDamages);
      expect(result.damages).toEqual([]);
    });

    it('should use current date if createdAt or updatedAt are missing', () => {
      const rawWithoutDates: RawClaim = {
        ...rawClaim,
        createdAt: undefined,
        updatedAt: undefined,
      };
      const result = ClaimMapper.toDomain(rawWithoutDates);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('toPersistence', () => {
    it('should map Claim entity to RawClaim', () => {
      const result = ClaimMapper.toPersistence(claimEntity);

      expect(result._id).toBe(claimEntity.id);
      expect(result.title).toBe(claimEntity.title);
      expect(result.status).toBe(claimEntity.status);
      expect(result.damages!).toHaveLength(1);
      expect(result.damages![0]._id).toBe(damageEntity.id);
      expect(result.totalAmount).toBe(claimEntity.totalAmount);
    });

    it('should map Claim entity without damages to RawClaim', () => {
      const emptyClaim = new Claim('c2', 't', 'd', ClaimStatus.Pending, []);
      const result = ClaimMapper.toPersistence(emptyClaim);

      expect(result.damages!).toHaveLength(0);
      expect(result.totalAmount).toBe(0);
    });
  });

  describe('toResponse', () => {
    it('should map Claim entity to response DTO', () => {
      const result = ClaimMapper.toResponse(claimEntity);

      expect(result.id).toBe(claimEntity.id);
      expect(result.title).toBe(claimEntity.title);
      expect(result.status).toBe(claimEntity.status);
      expect(result.totalAmount).toBe(claimEntity.totalAmount);
      expect(result.damages).toHaveLength(1);
      expect(result.damages[0].id).toBe(damageEntity.id);
      expect(result.createdAt).toBe(claimEntity.createdAt);
      expect(result.updatedAt).toBe(claimEntity.updatedAt);
    });

    it('should map Claim entity without damages to response DTO', () => {
      const emptyClaim = new Claim('c2', 't', 'd', ClaimStatus.Pending, []);
      const result = ClaimMapper.toResponse(emptyClaim);

      expect(result.damages).toHaveLength(0);
      expect(result.totalAmount).toBe(0);
    });
  });

  describe('toSummaryResponse', () => {
    it('should map RawClaim to summary response DTO', () => {
      const result = ClaimMapper.toSummaryResponse(rawClaim);

      expect(result.id).toBe(rawClaim._id);
      expect(result.title).toBe(rawClaim.title);
      expect(result.description).toBe(rawClaim.description);
      expect(result.status).toBe(rawClaim.status);
      expect(result.totalAmount).toBe(rawClaim.totalAmount);
    });
  });
});
