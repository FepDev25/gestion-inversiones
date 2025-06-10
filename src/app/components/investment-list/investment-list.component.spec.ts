import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BehaviorSubject, of } from 'rxjs';

import { InvestmentListComponent } from './investment-list.component';
import { InvestmentCardComponent } from './investment-card/investment-card.component';
import { InvestmentService } from '../../services/investment.service';
import { Investment, StockInvestment, CryptoInvestment, RealEstateInvestment, BondInvestment, BusinessInvestment, OtherInvestment } from '../../models';
import { AppState } from '../../models/app-state.model';

// Mock investments
const mockInvestments: Investment[] = [
  { id: '1', name: 'Stock A', type: 'stocks', amount: 100, monthlyEarning: 5, addedAt: 1, tickerSymbol: 'STKA', shares: 10, acquisitionPercentage: 1 },
  { id: '2', name: 'Crypto B', type: 'crypto', amount: 200, monthlyEarning: 10, addedAt: 1, cryptoName: 'BTC', walletAddress: '0xabc' },
  { id: '3', name: 'Stock C', type: 'stocks', amount: 300, monthlyEarning: 15, addedAt: 1, tickerSymbol: 'STKC', shares: 5, acquisitionPercentage: 1 },
  { id: '4', name: 'Real Estate D', type: 'real-estate', amount: 10000, monthlyEarning: 50, addedAt: 2, propertyAddress: '123 Main St', propertyType: 'residential' },
];

class MockInvestmentService {
  private _state$ = new BehaviorSubject<AppState>({
    initialCapital: 5000,
    currentBalance: 3000,
    investments: [...mockInvestments],
    currentMonth: 1,
    monthlyEarnings: 0,
    monthlyPerformance: 0,
    history: [],
  });

  getState() {
    return this._state$.asObservable();
  }

  // Add other methods if they are called directly by the component and need mocking
  removeInvestment(id: string) {
    const currentAppState = this._state$.getValue();
    const newInvestments = currentAppState.investments.filter(inv => inv.id !== id);
    this._state$.next({ ...currentAppState, investments: newInvestments });
  }
}

describe('InvestmentListComponent', () => {
  let component: InvestmentListComponent;
  let fixture: ComponentFixture<InvestmentListComponent>;
  let investmentService: InvestmentService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        FontAwesomeModule,
        InvestmentListComponent, // Component is standalone
        // InvestmentCardComponent // Also standalone, imported by InvestmentListComponent
      ],
      providers: [
        { provide: InvestmentService, useClass: MockInvestmentService }
      ]
    })
    // .overrideComponent(InvestmentListComponent, { // Not needed as InvestmentCardComponent is imported by InvestmentListComponent
    //   remove: { imports: [InvestmentCardComponent] },
    //   add: { imports: [] } // If we wanted to mock InvestmentCardComponent, but not necessary for this test
    // })
    .compileComponents();

    fixture = TestBed.createComponent(InvestmentListComponent);
    component = fixture.componentInstance;
    investmentService = TestBed.inject(InvestmentService); // Get the provided mock instance
    fixture.detectChanges(); // Trigger ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all investments initially (default filter "all")', () => {
    expect(component.investments.length).toBe(mockInvestments.length);
    expect(component.allInvestments.length).toBe(mockInvestments.length);
  });

  it('should filter investments by type "stocks"', () => {
    component.selectedType = 'stocks';
    component.filterInvestments();
    fixture.detectChanges();
    expect(component.investments.length).toBe(2);
    expect(component.investments.every(inv => inv.type === 'stocks')).toBeTrue();
  });

  it('should filter investments by type "crypto"', () => {
    component.selectedType = 'crypto';
    component.filterInvestments();
    fixture.detectChanges();
    expect(component.investments.length).toBe(1);
    expect(component.investments[0].type).toBe('crypto');
  });

  it('should filter investments by type "real-estate"', () => {
    component.selectedType = 'real-estate';
    component.filterInvestments();
    fixture.detectChanges();
    expect(component.investments.length).toBe(1);
    expect(component.investments[0].type).toBe('real-estate');
  });

  it('should show all investments when type is "all"', () => {
    // First filter to something else
    component.selectedType = 'stocks';
    component.filterInvestments();
    fixture.detectChanges();
    expect(component.investments.length).toBe(2);

    // Then filter back to 'all'
    component.selectedType = 'all';
    component.filterInvestments();
    fixture.detectChanges();
    expect(component.investments.length).toBe(mockInvestments.length);
  });

  it('should update filter when onTypeChange is called (simulating select change)', () => {
    const mockEvent = {
      target: { value: 'crypto' }
    } as unknown as Event; // Type assertion for simplicity

    component.onTypeChange(mockEvent);
    fixture.detectChanges();

    expect(component.selectedType).toBe('crypto');
    expect(component.investments.length).toBe(1);
    expect(component.investments[0].type).toBe('crypto');
  });

  it('should correctly populate investmentTypes from getAllInvestmentTypes', () => {
      const expectedTypes: InvestmentType[] = ['stocks', 'real-estate', 'crypto', 'bonds', 'business', 'other'];
      expect(component.investmentTypes).toEqual(expectedTypes);
  });

});
