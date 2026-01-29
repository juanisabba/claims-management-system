export class ClaimNotFoundException extends Error {
  constructor(message?: string) {
    super(message || 'Claim not found.');
    this.name = 'ClaimNotFoundException';
  }
}
