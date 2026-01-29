import { TestBed } from '@angular/core/testing';
import { ClaimsStore } from './claims.store';
import { ClaimRepository } from '../../../core/repositories/claim.repository';
import { of } from 'rxjs';
import { Claim, Severity } from '../../../core/models/claim.model';
import { ClaimStatus } from '../../../core/models/claim-status.enum';

describe('ClaimsStore', () => {
  let store: ClaimsStore;
  let repositorySpy: any;

  const mockClaim: Claim = {
    id: '1',
    title: 'Test Claim',
    description: 'Test Description',
    status: ClaimStatus.Pending,
    damages: [
      { id: 'd1', part: 'bumper', severity: Severity.LOW, imageUrl: '', price: 100 },
      { id: 'd2', part: 'hood', severity: Severity.HIGH, imageUrl: '', price: 200 },
    ],
    totalAmount: 300,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Create a mock repository object manually to avoid dependency on global 'jasmine' if using Vitest without compat
    repositorySpy = {
      getClaimById: () => of(mockClaim),
      addDamage: () => of(mockClaim),
      deleteDamage: () => of(mockClaim),
      getClaims: () => of([]),
      updateStatus: () => of(mockClaim),
    };

    // Use spyOn if available (Jasmine/Vitest compatibility often provides this)
    // If we are in a strict Vitest environment without globals, we might need 'vi.spyOn'
    // But 'describe' and 'it' are already globals here, so 'spyOn' likely is too or we just mock return values directly.

    // Better: just assign functions that we can spy on if needed, or simply let them return observables.
    // For this test, simply checking state updates is enough.

    TestBed.configureTestingModule({
      providers: [ClaimsStore, { provide: ClaimRepository, useValue: repositorySpy }],
    });

    store = TestBed.inject(ClaimsStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should load claim and calculate totalAmount', async () => {
    // We can override the method implementation for specific tests
    repositorySpy.getClaimById = () => of(mockClaim);

    await store.loadClaim('1');

    expect(store.claim()).toEqual(mockClaim);
    expect(store.totalAmount()).toBe(300); // 100 + 200
  });

  it('should update claim when adding damage', async () => {
    repositorySpy.getClaimById = () => of(mockClaim);
    await store.loadClaim('1');

    const updatedClaim = {
      ...mockClaim,
      damages: [
        ...mockClaim.damages,
        { id: 'd3', part: 'door', severity: Severity.MID, imageUrl: '', price: 150 },
      ],
    };
    repositorySpy.addDamage = () => of(updatedClaim);

    await store.addDamage({ part: 'door', severity: Severity.MID, imageUrl: '', price: 150 });

    expect(store.claim()).toEqual(updatedClaim);
    expect(store.totalAmount()).toBe(450); // 300 + 150
  });

  it('should update claim when deleting damage', async () => {
    repositorySpy.getClaimById = () => of(mockClaim);
    await store.loadClaim('1');

    const updatedClaim = {
      ...mockClaim,
      damages: [mockClaim.damages[0]], // keep only first one
    };
    repositorySpy.deleteDamage = () => of(updatedClaim);

    await store.deleteDamage('d2');

    expect(store.claim()).toEqual(updatedClaim);
    expect(store.totalAmount()).toBe(100);
  });
});
