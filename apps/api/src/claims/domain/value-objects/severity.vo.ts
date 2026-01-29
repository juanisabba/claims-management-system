import { DomainError } from '../errors/domain-error';

export class InvalidSeverityError extends DomainError {
  constructor(value: string) {
    super(`Invalid severity value: ${value}`);
  }
}

export class Severity {
  private static readonly VALID_SEVERITIES = ['low', 'mid', 'high'];
  readonly value: string;

  constructor(value: string) {
    if (!Severity.VALID_SEVERITIES.includes(value)) {
      throw new InvalidSeverityError(value);
    }
    this.value = value;
  }

  static create(value: string): Severity {
    return new Severity(value);
  }
}
