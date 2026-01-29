import { ClaimNotFoundException } from './claim-not-found.exception';

describe('ClaimNotFoundException', () => {
  it('should use default message', () => {
    const exception = new ClaimNotFoundException();
    expect(exception.message).toBe('Claim not found.');
    expect(exception.name).toBe('ClaimNotFoundException');
  });

  it('should use provided message', () => {
    const exception = new ClaimNotFoundException('Custom message');
    expect(exception.message).toBe('Custom message');
  });
});
