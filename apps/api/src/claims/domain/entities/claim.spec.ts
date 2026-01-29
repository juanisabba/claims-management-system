import { Claim } from './claim.entity';
import { Damage } from './damage.entity';
import { ClaimStatus } from '../value-objects/claim-status.enum';
import { SeverityEnum } from '../value-objects/severity.enum';
import { DomainError } from '../errors/domain-error';
describe('Claim Entity', () => {
  let claim: Claim;
  const damage1 = new Damage(
    'd1',
    'part1',
    SeverityEnum.LOW,
    'http://img1.com',
    100,
  );
  const damage2 = new Damage(
    'd2',
    'part2',
    SeverityEnum.HIGH,
    'http://img2.com',
    200,
  );

  beforeEach(() => {
    claim = new Claim(
      'claim1',
      'Test Claim',
      'This is a description that is definitely longer than one hundred characters to meet the requirement for finishing the claim. It just needs to be very long.',
      ClaimStatus.Pending,
      [],
    );
  });

  describe('Constructor and mapStatusToState', () => {
    it('should initialize with InReview status', () => {
      const inReviewClaim = new Claim('c', 't', 'd', ClaimStatus.InReview);
      expect(inReviewClaim.status).toBe(ClaimStatus.InReview);
    });

    it('should initialize with Finished status', () => {
      const finishedClaim = new Claim('c', 't', 'd', ClaimStatus.Finished);
      expect(finishedClaim.status).toBe(ClaimStatus.Finished);
    });

    it('should initialize with default Pending status', () => {
      const defaultClaim = new Claim('c', 't', 'd');
      expect(defaultClaim.status).toBe(ClaimStatus.Pending);
    });
  });

  describe('totalAmount', () => {
    it('should calculate total amount correctly', () => {
      claim.addDamage(damage1);
      claim.addDamage(damage2);
      expect(claim.totalAmount).toBe(300);
    });

    it('should be 0 when no damages', () => {
      expect(claim.totalAmount).toBe(0);
    });
  });

  describe('Damage Management', () => {
    it('should add damage in Pending state', () => {
      claim.addDamage(damage1);
      expect(claim.damages).toHaveLength(1);
      expect(claim.damages[0]).toBe(damage1);
    });

    it('should remove damage in Pending state', () => {
      claim.addDamage(damage1);
      claim.removeDamage(damage1.id);
      expect(claim.damages).toHaveLength(0);
    });

    it('should update damage in Pending state', () => {
      claim.addDamage(damage1);
      const updatedDamage = new Damage(
        'd1',
        'part1 updated',
        SeverityEnum.MID,
        'http://img1.com',
        150,
      );
      claim.updateDamage(updatedDamage);
      expect(claim.damages[0].price).toBe(150);
      expect(claim.damages[0].part).toBe('part1 updated');
    });

    it('should throw error when adding existing damage', () => {
      claim.addDamage(damage1);
      expect(() => claim.addDamage(damage1)).toThrow(DomainError);
    });

    it('should throw error when removing non-existent damage', () => {
      expect(() => claim.removeDamage('non-existent')).toThrow(DomainError);
    });

    it('should throw error when updating non-existent damage', () => {
      expect(() => claim.updateDamage(damage1)).toThrow(DomainError);
    });
  });

  describe('validateFinishRules', () => {
    it('should validate successfully when rules are met', () => {
      claim.addDamage(damage2); // High severity
      // Description is already long enough in beforeEach
      expect(() => claim.validateFinishRules()).not.toThrow();
    });

    it('should throw error if description is too short', () => {
      claim = new Claim(
        'claim2',
        'Short',
        'Short description',
        ClaimStatus.Pending,
        [damage2],
      );
      expect(() => claim.validateFinishRules()).toThrow(DomainError);
      expect(() => claim.validateFinishRules()).toThrow(
        'Claim description must exceed 100 characters',
      );
    });

    it('should throw error if no high severity damage', () => {
      claim.addDamage(damage1); // Low severity
      expect(() => claim.validateFinishRules()).toThrow(DomainError);
      expect(() => claim.validateFinishRules()).toThrow(
        'Claim must have at least one high severity damage',
      );
    });
  });

  describe('State Transitions', () => {
    describe('Pending State', () => {
      it('should transition to InReview', () => {
        claim.transitionTo(ClaimStatus.InReview);
        expect(claim.status).toBe(ClaimStatus.InReview);
      });

      it('should transition to Finished if valid', () => {
        claim.addDamage(damage2);
        claim.transitionTo(ClaimStatus.Finished);
        expect(claim.status).toBe(ClaimStatus.Finished);
      });

      it('should fail to transition to Finished if invalid', () => {
        claim.addDamage(damage1); // Low severity only
        expect(() => claim.transitionTo(ClaimStatus.Finished)).toThrow(
          DomainError,
        );
        expect(claim.status).toBe(ClaimStatus.Pending);
      });

      it('should fail to transition to Pending (self transition not explicitly handled but implied invalid)', () => {
        expect(() => claim.transitionTo(ClaimStatus.Pending)).toThrow(
          DomainError,
        );
      });
    });

    describe('InReview State', () => {
      beforeEach(() => {
        claim.transitionTo(ClaimStatus.InReview);
      });

      it('should not allow adding damage', () => {
        expect(() => claim.addDamage(damage1)).toThrow(DomainError);
        expect(() => claim.addDamage(damage1)).toThrow('BR-02');
      });

      it('should not allow removing damage', () => {
        // We need a damage to remove, but we can't add it in InReview.
        // So we must have added it before.
        const claimWithDamage = new Claim('c2', 't', 'd', ClaimStatus.Pending, [
          damage1,
        ]);
        claimWithDamage.transitionTo(ClaimStatus.InReview);
        expect(() => claimWithDamage.removeDamage(damage1.id)).toThrow(
          DomainError,
        );
        expect(() => claimWithDamage.removeDamage(damage1.id)).toThrow('BR-02');
      });

      it('should not allow updating damage', () => {
        const claimWithDamage = new Claim('c2', 't', 'd', ClaimStatus.Pending, [
          damage1,
        ]);
        claimWithDamage.transitionTo(ClaimStatus.InReview);
        const updated = new Damage('d1', 'p', SeverityEnum.MID, 'u', 200);
        expect(() => claimWithDamage.updateDamage(updated)).toThrow(
          DomainError,
        );
        expect(() => claimWithDamage.updateDamage(updated)).toThrow('BR-02');
      });

      it('should transition back to Pending', () => {
        claim.transitionTo(ClaimStatus.Pending);
        expect(claim.status).toBe(ClaimStatus.Pending);
      });

      it('should transition to Finished if valid', () => {
        // Create a valid claim first
        const validClaim = new Claim(
          'valid',
          'Title',
          'This is a description that is definitely longer than one hundred characters to meet the requirement for finishing the claim. It just needs to be very long.',
          ClaimStatus.Pending,
          [damage2],
        );
        validClaim.transitionTo(ClaimStatus.InReview);

        validClaim.transitionTo(ClaimStatus.Finished);
        expect(validClaim.status).toBe(ClaimStatus.Finished);
      });

      it('should fail to transition to Finished if invalid', () => {
        const invalidClaim = new Claim(
          'invalid',
          'Title',
          'Short desc',
          ClaimStatus.Pending,
          [damage2],
        );
        invalidClaim.transitionTo(ClaimStatus.InReview);
        expect(() => invalidClaim.transitionTo(ClaimStatus.Finished)).toThrow(
          DomainError,
        );
      });

      it('should fail to transition to InReview (self transition)', () => {
        expect(() => claim.transitionTo(ClaimStatus.InReview)).toThrow(
          DomainError,
        );
        expect(() => claim.transitionTo(ClaimStatus.InReview)).toThrow(
          'Cannot transition from In Review to In Review',
        );
      });
    });

    describe('Finished State', () => {
      let finishedClaim: Claim;
      beforeEach(() => {
        finishedClaim = new Claim(
          'finished',
          'Title',
          'This is a description that is definitely longer than one hundred characters to meet the requirement for finishing the claim. It just needs to be very long.',
          ClaimStatus.Pending,
          [damage2],
        );
        finishedClaim.transitionTo(ClaimStatus.Finished);
      });

      it('should not allow adding damage', () => {
        expect(() => finishedClaim.addDamage(damage1)).toThrow(DomainError);
        expect(() => finishedClaim.addDamage(damage1)).toThrow('BR-01');
      });

      it('should not allow removing damage', () => {
        expect(() => finishedClaim.removeDamage(damage2.id)).toThrow(
          DomainError,
        );
        expect(() => finishedClaim.removeDamage(damage2.id)).toThrow('BR-01');
      });

      it('should not allow updating damage', () => {
        expect(() => finishedClaim.updateDamage(damage2)).toThrow(DomainError);
        expect(() => finishedClaim.updateDamage(damage2)).toThrow('BR-01');
      });

      it('should not transition to any other status', () => {
        expect(() => finishedClaim.transitionTo(ClaimStatus.Pending)).toThrow(
          DomainError,
        );
        expect(() => finishedClaim.transitionTo(ClaimStatus.InReview)).toThrow(
          DomainError,
        );
      });
    });
  });
});
