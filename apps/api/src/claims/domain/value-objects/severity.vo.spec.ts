import { Severity, InvalidSeverityError } from './severity.vo';

describe('Severity Value Object', () => {
  it('should create a valid severity', () => {
    const severity = Severity.create('low');
    expect(severity.value).toBe('low');
  });

  it('should throw error for invalid severity', () => {
    expect(() => Severity.create('invalid')).toThrow(InvalidSeverityError);
  });

  it('should allow mid and high severities', () => {
    expect(Severity.create('mid').value).toBe('mid');
    expect(Severity.create('high').value).toBe('high');
  });
});
