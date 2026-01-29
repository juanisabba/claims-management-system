import { Severity } from '../value-objects/severity.vo';
import { DomainError } from '../errors/domain-error';

export class Damage {
  readonly id: string;
  readonly part: string;
  readonly severity: Severity;
  readonly imageUrl: string;
  readonly price: number;

  constructor(
    id: string,
    part: string,
    severity: Severity,
    imageUrl: string,
    price: number,
  ) {
    if (price < 0) {
      throw new DomainError('Price must be greater than or equal to 0.');
    }

    if (!imageUrl) {
      throw new DomainError('Image URL must not be empty.');
    }

    if (!part) {
      throw new DomainError('Part must not be empty.');
    }

    this.id = id;
    this.part = part;
    this.severity = severity;
    this.imageUrl = imageUrl;
    this.price = price;
  }
}
