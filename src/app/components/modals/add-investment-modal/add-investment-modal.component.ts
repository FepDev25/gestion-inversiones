import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { InvestmentService } from '../../../services/investment.service';
import {
  Investment,
  InvestmentType,
  getAllInvestmentTypes,
  StockInvestment,
  CryptoInvestment,
  RealEstateInvestment,
  BondInvestment,
  BusinessInvestment,
  OtherInvestment
} from '../../../models'; // Adjusted import
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-add-investment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule], // Add FontAwesomeModule
  templateUrl: './add-investment-modal.component.html',
  styleUrls: ['./add-investment-modal.component.css']
})
export class AddInvestmentModalComponent {
  @Input() isVisible: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  investmentName: string = '';
  investmentType: InvestmentType = 'stocks'; // Use InvestmentType
  investmentAmount: number | null = null;
  monthlyEarning: number | null = null;
  investmentDescription: string = '';

  investmentTypes: InvestmentType[] = getAllInvestmentTypes();

  // Stock specific
  tickerSymbol: string = '';
  shares: number | null = null;
  acquisitionPercentage: number | null = null; // Store as 0-1

  // Crypto specific
  cryptoName: string = '';
  walletAddress: string = '';

  // Real Estate specific
  propertyAddress: string = '';
  propertyType: 'residential' | 'commercial' | 'industrial' | 'land' = 'residential';
  propertyTypes: Array<'residential' | 'commercial' | 'industrial' | 'land'> = ['residential', 'commercial', 'industrial', 'land'];

  // Bond specific
  issuerName: string = '';
  maturityDate: string = ''; // Store as string YYYY-MM-DD for input type="date"
  couponRate: number | null = null; // Store as 0-1

  // Business specific
  businessName: string = '';
  stakePercentage: number | null = null; // Store as 0-1

  constructor(private investmentService: InvestmentService, library: FaIconLibrary) {
    library.addIcons(faTimes);
  }

  onSubmit(): void {
    if (!this.investmentName || this.investmentAmount === null || this.monthlyEarning === null || this.investmentAmount <= 0) {
      alert('Por favor, complete los campos obligatorios (Nombre, Capital Invertido, Ganancia Mensual Estimada) y asegúrese que el capital invertido sea mayor a cero.');
      return;
    }

    const currentBalance = this.investmentService.getCurrentState().currentBalance;
    if (this.investmentAmount > currentBalance) {
        alert("No tienes suficiente capital para esta inversión. Saldo actual: $" + currentBalance.toLocaleString('es-ES', {maximumFractionDigits: 2}));
        return;
    }

    let newInvestmentData: Omit<Investment, 'id' | 'addedAt'>;

    switch (this.investmentType) {
      case 'stocks':
        if (!this.tickerSymbol || !this.shares || this.shares <=0 || this.acquisitionPercentage === null || this.acquisitionPercentage < 0 || this.acquisitionPercentage > 1) {
          alert('Por favor, complete todos los campos específicos para Acciones correctamente (Símbolo, Cantidad > 0, % Adquisición entre 0 y 1).');
          return;
        }
        newInvestmentData = {
          name: this.investmentName,
          type: 'stocks',
          amount: this.investmentAmount!,
          monthlyEarning: this.monthlyEarning!,
          description: this.investmentDescription,
          tickerSymbol: this.tickerSymbol,
          shares: this.shares,
          acquisitionPercentage: this.acquisitionPercentage,
        };
        break;
      case 'crypto':
        if (!this.cryptoName) {
          alert('Por favor, complete todos los campos específicos para Crypto (Nombre Crypto).');
          return;
        }
        newInvestmentData = {
          name: this.investmentName,
          type: 'crypto',
          amount: this.investmentAmount!,
          monthlyEarning: this.monthlyEarning!,
          description: this.investmentDescription,
          cryptoName: this.cryptoName,
          walletAddress: this.walletAddress || undefined, // Optional
        };
        break;
      case 'real-estate':
        if (!this.propertyAddress) {
            alert('Por favor, ingrese la dirección de la propiedad.');
            return;
        }
        newInvestmentData = {
            name: this.investmentName,
            type: 'real-estate',
            amount: this.investmentAmount!,
            monthlyEarning: this.monthlyEarning!,
            description: this.investmentDescription,
            propertyAddress: this.propertyAddress,
            propertyType: this.propertyType,
        };
        break;
    case 'bonds':
        if (!this.issuerName || !this.maturityDate || this.couponRate === null || this.couponRate < 0 || this.couponRate > 1) {
            alert('Por favor, complete todos los campos específicos para Bonos correctamente (Emisor, Fecha de Vencimiento, Tasa de Cupón entre 0 y 1).');
            return;
        }
        newInvestmentData = {
            name: this.investmentName,
            type: 'bonds',
            amount: this.investmentAmount!,
            monthlyEarning: this.monthlyEarning!,
            description: this.investmentDescription,
            issuerName: this.issuerName,
            maturityDate: new Date(this.maturityDate).getTime(), // Convert to timestamp
            couponRate: this.couponRate,
        };
        break;
    case 'business':
        if (!this.businessName || this.stakePercentage === null || this.stakePercentage < 0 || this.stakePercentage > 1) {
            alert('Por favor, complete todos los campos específicos para Negocios correctamente (Nombre del Negocio, % Participación entre 0 y 1).');
            return;
        }
        newInvestmentData = {
            name: this.investmentName,
            type: 'business',
            amount: this.investmentAmount!,
            monthlyEarning: this.monthlyEarning!,
            description: this.investmentDescription,
            businessName: this.businessName,
            stakePercentage: this.stakePercentage,
        };
        break;
    case 'other':
    default: // Fallback for 'other' or if type somehow becomes unset
        newInvestmentData = {
            name: this.investmentName,
            type: this.investmentType, // Ensures 'other' is correctly passed or any valid type
            amount: this.investmentAmount!,
            monthlyEarning: this.monthlyEarning!,
            description: this.investmentDescription,
        };
        break;
    }

    this.investmentService.addInvestment(newInvestmentData);
    this.resetForm();
    this.closeModal.emit();
  }

  onCancel(): void {
    this.resetForm();
    this.closeModal.emit();
  }

  private resetForm(): void {
    this.investmentName = '';
    this.investmentType = 'stocks'; // Default type
    this.investmentAmount = null;
    this.monthlyEarning = null;
    this.investmentDescription = '';

    // Reset Stock specific
    this.tickerSymbol = '';
    this.shares = null;
    this.acquisitionPercentage = null;

    // Reset Crypto specific
    this.cryptoName = '';
    this.walletAddress = '';

    // Reset Real Estate specific
    this.propertyAddress = '';
    this.propertyType = 'residential';

    // Reset Bond specific
    this.issuerName = '';
    this.maturityDate = '';
    this.couponRate = null;

    // Reset Business specific
    this.businessName = '';
    this.stakePercentage = null;
  }
}
