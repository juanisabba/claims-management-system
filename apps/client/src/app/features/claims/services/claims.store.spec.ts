import { TestBed } from '@angular/core/testing';
import { ClaimsStore } from './claims.store';
import { ClaimRepository } from '../../../core/repositories/claim.repository';
import { ToastService } from '../../../core/services/toast.service';
import { of } from 'rxjs';
import { Claim, Severity } from '../../../core/models/claim.model';
import { ClaimStatus } from '../../../core/models/claim-status.enum';

describe('ClaimsStore', () => {
  let store: ClaimsStore;
  let repositorySpy: Partial<ClaimRepository>;
  let toastServiceSpy: Partial<ToastService>;

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
    // Create a mock repository object manually
    repositorySpy = {
      getClaimById: () => of(mockClaim),
      addDamage: () => of(mockClaim),
      deleteDamage: () => of(undefined),
      getClaims: () => of({ data: [], total: 0, limit: 10, offset: 0 }),
      updateStatus: () => of(mockClaim),
      getDamages: () =>
        of({ data: mockClaim.damages, total: mockClaim.damages.length, limit: 5, offset: 0 }),
    };

    toastServiceSpy = {
      success: () => {},
      error: () => {},
    };

    TestBed.configureTestingModule({
      providers: [
        ClaimsStore,
        { provide: ClaimRepository, useValue: repositorySpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
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

    repositorySpy.deleteDamage = () => of(undefined);
    repositorySpy.getDamages = () =>
      of({ data: [mockClaim.damages[0]], total: 1, limit: 5, offset: 0 });

    await store.deleteDamage('d2');

    const expectedClaim = {
      ...mockClaim,
      damages: [mockClaim.damages[0]],
    };

    expect(store.claim()).toEqual(expectedClaim);
    expect(store.totalAmount()).toBe(100);
  });
});
