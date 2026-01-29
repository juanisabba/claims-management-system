import { Damage } from './damage.entity';
import { SeverityEnum } from '../value-objects/severity.enum';
import { DomainError } from '../errors/domain-error';

describe('Damage Entity', () => {
  it('should create a valid damage', () => {
    const damage = new Damage(
      'd1',
      'fender',
      SeverityEnum.LOW,
      'http://img.com',
      100,
    );
    expect(damage.id).toBe('d1');
    expect(damage.part).toBe('fender');
    expect(damage.severity).toBe(SeverityEnum.LOW);
    expect(damage.imageUrl).toBe('http://img.com');
    expect(damage.price).toBe(100);
  });

  it('should throw error if price is negative', () => {
    expect(
      () => new Damage('d1', 'fender', SeverityEnum.LOW, 'http://img.com', -1),
    ).toThrow(DomainError);
  });

  it('should throw error if imageUrl is empty', () => {
    expect(() => new Damage('d1', 'fender', SeverityEnum.LOW, '', 100)).toThrow(
      DomainError,
    );
  });

  it('should throw error if part is empty', () => {
    expect(
      () => new Damage('d1', '', SeverityEnum.LOW, 'http://img.com', 100),
    ).toThrow(DomainError);
  });
});
