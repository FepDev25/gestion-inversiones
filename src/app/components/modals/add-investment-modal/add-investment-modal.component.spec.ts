import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms'; // For ngModel
import { NoopAnimationsModule } from '@angular/platform-browser/animations'; // If any animations are used implicitly or explicitly

import { AddInvestmentModalComponent } from './add-investment-modal.component';
import { InvestmentService } from '../../../services/investment.service';
import { AppState } from '../../../models/app-state.model';
import { Investment, StockInvestment, CryptoInvestment, RealEstateInvestment, BondInvestment, BusinessInvestment, OtherInvestment } from '../../../models';

describe('AddInvestmentModalComponent', () => {
  let component: AddInvestmentModalComponent;
  let fixture: ComponentFixture<AddInvestmentModalComponent>;
  let mockInvestmentService: jasmine.SpyObj<InvestmentService>;

  beforeEach(async () => {
    mockInvestmentService = jasmine.createSpyObj('InvestmentService', ['addInvestment', 'getCurrentState']);

    // Provide a default mock for getCurrentState, can be overridden in specific tests if needed
    mockInvestmentService.getCurrentState.and.returnValue({
      currentBalance: 10000,
      initialCapital: 10000,
      investments: [],
      currentMonth: 1,
      monthlyEarnings: 0,
      monthlyPerformance: 0,
      history: []
    } as AppState);

    await TestBed.configureTestingModule({
      imports: [
        FormsModule, // Needed for ngModel in the template
        NoopAnimationsModule, // Useful to avoid animation issues in tests
        AddInvestmentModalComponent // The component itself is standalone
      ],
      providers: [
        { provide: InvestmentService, useValue: mockInvestmentService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddInvestmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Initial data binding
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have investmentTypes populated', () => {
    expect(component.investmentTypes.length).toBeGreaterThan(0);
    expect(component.investmentTypes).toEqual(['stocks', 'real-estate', 'crypto', 'bonds', 'business', 'other']);
  });

  describe('Form Submission Logic', () => {
    beforeEach(() => {
      // Common fields that are always required
      component.investmentName = 'Test Investment';
      component.investmentAmount = 1000;
      component.monthlyEarning = 50;
      component.investmentDescription = 'Test Desc';
    });

    it('should call addInvestment with correct "stocks" data structure', () => {
      component.investmentType = 'stocks';
      component.tickerSymbol = 'TST';
      component.shares = 100;
      component.acquisitionPercentage = 0.5;
      fixture.detectChanges(); // Update bindings

      component.onSubmit();

      expect(mockInvestmentService.addInvestment).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: 'stocks',
          name: 'Test Investment',
          amount: 1000,
          monthlyEarning: 50,
          description: 'Test Desc',
          tickerSymbol: 'TST',
          shares: 100,
          acquisitionPercentage: 0.5
        } as Omit<StockInvestment, 'id' | 'addedAt'>)
      );
    });

    it('should call addInvestment with correct "crypto" data structure', () => {
      component.investmentType = 'crypto';
      component.cryptoName = 'BITC';
      component.walletAddress = '0x123abc';
      fixture.detectChanges();

      component.onSubmit();

      expect(mockInvestmentService.addInvestment).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: 'crypto',
          name: 'Test Investment',
          cryptoName: 'BITC',
          walletAddress: '0x123abc'
        } as Omit<CryptoInvestment, 'id' | 'addedAt'>)
      );
    });

    it('should call addInvestment with correct "crypto" data structure (optional wallet)', () => {
      component.investmentType = 'crypto';
      component.cryptoName = 'ETH';
      component.walletAddress = ''; // Optional field left empty
      fixture.detectChanges();

      component.onSubmit();

      expect(mockInvestmentService.addInvestment).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: 'crypto',
          name: 'Test Investment',
          cryptoName: 'ETH',
          walletAddress: undefined // Expect undefined when empty
        } as Omit<CryptoInvestment, 'id' | 'addedAt'>)
      );
    });

    it('should call addInvestment with correct "real-estate" data structure', () => {
      component.investmentType = 'real-estate';
      component.propertyAddress = '123 Main St';
      component.propertyType = 'commercial';
      fixture.detectChanges();

      component.onSubmit();

      expect(mockInvestmentService.addInvestment).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: 'real-estate',
          name: 'Test Investment',
          propertyAddress: '123 Main St',
          propertyType: 'commercial'
        } as Omit<RealEstateInvestment, 'id' | 'addedAt'>)
      );
    });

    it('should call addInvestment with correct "bonds" data structure', () => {
      component.investmentType = 'bonds';
      component.issuerName = 'Govt';
      component.maturityDate = '2030-12-31'; // YYYY-MM-DD
      component.couponRate = 0.05;
      fixture.detectChanges();

      component.onSubmit();

      const expectedMaturityTimestamp = new Date('2030-12-31').getTime();

      expect(mockInvestmentService.addInvestment).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: 'bonds',
          name: 'Test Investment',
          issuerName: 'Govt',
          maturityDate: expectedMaturityTimestamp,
          couponRate: 0.05
        } as Omit<BondInvestment, 'id' | 'addedAt'>)
      );
    });

    it('should call addInvestment with correct "business" data structure', () => {
      component.investmentType = 'business';
      component.businessName = 'My Cafe';
      component.stakePercentage = 0.25;
      fixture.detectChanges();

      component.onSubmit();

      expect(mockInvestmentService.addInvestment).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: 'business',
          name: 'Test Investment',
          businessName: 'My Cafe',
          stakePercentage: 0.25
        } as Omit<BusinessInvestment, 'id' | 'addedAt'>)
      );
    });

    it('should call addInvestment with correct "other" data structure', () => {
      component.investmentType = 'other';
      fixture.detectChanges();

      component.onSubmit();

      expect(mockInvestmentService.addInvestment).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: 'other',
          name: 'Test Investment',
          amount: 1000,
          monthlyEarning: 50,
          description: 'Test Desc'
          // No specific fields for 'other' beyond common ones
        } as Omit<OtherInvestment, 'id' | 'addedAt'>)
      );
    });

    // --- Validation Alert Tests ---
    it('should show alert if common fields are invalid', () => {
        spyOn(window, 'alert');
        component.investmentName = ''; // Invalid
        fixture.detectChanges();
        component.onSubmit();
        expect(window.alert).toHaveBeenCalledWith('Por favor, complete los campos obligatorios (Nombre, Capital Invertido, Ganancia Mensual Estimada) y asegúrese que el capital invertido sea mayor a cero.');
        expect(mockInvestmentService.addInvestment).not.toHaveBeenCalled();
    });

    it('should show alert if investmentAmount exceeds currentBalance', () => {
        spyOn(window, 'alert');
        mockInvestmentService.getCurrentState.and.returnValue({ currentBalance: 500 } as AppState);
        component.investmentAmount = 600; // Exceeds balance
        fixture.detectChanges();
        component.onSubmit();
        expect(window.alert).toHaveBeenCalledWith("No tienes suficiente capital para esta inversión. Saldo actual: $" + (500).toLocaleString('es-ES', {maximumFractionDigits: 2}));
        expect(mockInvestmentService.addInvestment).not.toHaveBeenCalled();
    });

    it('should show alert for "stocks" if specific fields are invalid', () => {
        spyOn(window, 'alert');
        component.investmentType = 'stocks';
        component.tickerSymbol = ''; // Invalid
        fixture.detectChanges();
        component.onSubmit();
        expect(window.alert).toHaveBeenCalledWith('Por favor, complete todos los campos específicos para Acciones correctamente (Símbolo, Cantidad > 0, % Adquisición entre 0 y 1).');
        expect(mockInvestmentService.addInvestment).not.toHaveBeenCalled();
    });

    it('should show alert for "crypto" if specific fields are invalid', () => {
        spyOn(window, 'alert');
        component.investmentType = 'crypto';
        component.cryptoName = ''; // Invalid
        fixture.detectChanges();
        component.onSubmit();
        expect(window.alert).toHaveBeenCalledWith('Por favor, complete todos los campos específicos para Crypto (Nombre Crypto).');
        expect(mockInvestmentService.addInvestment).not.toHaveBeenCalled();
    });

    it('should show alert for "real-estate" if specific fields are invalid', () => {
        spyOn(window, 'alert');
        component.investmentType = 'real-estate';
        component.propertyAddress = ''; // Invalid
        fixture.detectChanges();
        component.onSubmit();
        expect(window.alert).toHaveBeenCalledWith('Por favor, ingrese la dirección de la propiedad.');
        expect(mockInvestmentService.addInvestment).not.toHaveBeenCalled();
    });

    it('should show alert for "bonds" if specific fields are invalid', () => {
        spyOn(window, 'alert');
        component.investmentType = 'bonds';
        component.issuerName = ''; // Invalid
        fixture.detectChanges();
        component.onSubmit();
        expect(window.alert).toHaveBeenCalledWith('Por favor, complete todos los campos específicos para Bonos correctamente (Emisor, Fecha de Vencimiento, Tasa de Cupón entre 0 y 1).');
        expect(mockInvestmentService.addInvestment).not.toHaveBeenCalled();
    });

    it('should show alert for "business" if specific fields are invalid', () => {
        spyOn(window, 'alert');
        component.investmentType = 'business';
        component.businessName = ''; // Invalid
        fixture.detectChanges();
        component.onSubmit();
        expect(window.alert).toHaveBeenCalledWith('Por favor, complete todos los campos específicos para Negocios correctamente (Nombre del Negocio, % Participación entre 0 y 1).');
        expect(mockInvestmentService.addInvestment).not.toHaveBeenCalled();
    });

  });

  describe('Reset Form Logic', () => {
    it('should reset all common and specific fields', () => {
      component.investmentName = 'Old Name';
      component.investmentType = 'stocks';
      component.investmentAmount = 100;
      component.monthlyEarning = 10;
      component.investmentDescription = 'Old Desc';
      component.tickerSymbol = 'OLD';
      component.shares = 1;
      component.acquisitionPercentage = 0.1;
      component.cryptoName = 'OLDCRY';
      component.walletAddress = '0xOLD';
      component.propertyAddress = 'Old Address';
      component.propertyType = 'commercial';
      component.issuerName = 'Old Issuer';
      component.maturityDate = '2020-01-01';
      component.couponRate = 0.01;
      component.businessName = 'Old Biz';
      component.stakePercentage = 0.1;

      component.onCancel(); // This calls resetForm and emits closeModal

      expect(component.investmentName).toBe('');
      expect(component.investmentType).toBe('stocks'); // Default
      expect(component.investmentAmount).toBeNull();
      expect(component.monthlyEarning).toBeNull();
      expect(component.investmentDescription).toBe('');

      expect(component.tickerSymbol).toBe('');
      expect(component.shares).toBeNull();
      expect(component.acquisitionPercentage).toBeNull();
      expect(component.cryptoName).toBe('');
      expect(component.walletAddress).toBe('');
      expect(component.propertyAddress).toBe('');
      expect(component.propertyType).toBe('residential'); // Default
      expect(component.issuerName).toBe('');
      expect(component.maturityDate).toBe('');
      expect(component.couponRate).toBeNull();
      expect(component.businessName).toBe('');
      expect(component.stakePercentage).toBeNull();
    });
  });

  it('should emit closeModal on onCancel()', () => {
    spyOn(component.closeModal, 'emit');
    component.onCancel();
    expect(component.closeModal.emit).toHaveBeenCalled();
  });

  it('should emit closeModal on successful onSubmit()', () => {
    spyOn(component.closeModal, 'emit');
    // Set valid data for 'other' type for simplicity
    component.investmentName = 'Test Other';
    component.investmentAmount = 100;
    component.monthlyEarning = 5;
    component.investmentType = 'other';
    fixture.detectChanges();

    component.onSubmit();

    expect(mockInvestmentService.addInvestment).toHaveBeenCalled(); // Ensure submit logic ran
    expect(component.closeModal.emit).toHaveBeenCalled();
  });

});
