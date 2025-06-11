import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { InvestmentService } from '../../../services/investment.service';
import { Investment } from '../../../models/investment.model';
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

  // Propiedades básicas
  investmentName: string = '';
  investmentType: Investment['type'] = 'stocks';
  investmentAmount: number | null = null;
  monthlyEarning: number | null = null;
  investmentDescription: string = '';

  // Tipos de inversión disponibles
  investmentTypes: Investment['type'][] = ['stocks', 'crypto', 'real-estate', 'bonds', 'business'];

  // Propiedades para acciones
  tickerSymbol: string = '';
  shares: number | null = null;
  acquisitionPercentage: number | null = null;

  // Propiedades para criptomonedas
  cryptoName: string = '';
  walletAddress: string = '';

  // Propiedades para bienes raíces
  propertyAddress: string = '';
  propertyType: string = '';
  propertyTypes: string[] = ['residential', 'commercial', 'industrial', 'land'];

  // Propiedades para bonos
  issuerName: string = '';
  maturityDate: string = '';
  couponRate: number | null = null;

  // Propiedades para negocios
  businessName: string = '';
  stakePercentage: number | null = null;

  constructor(private investmentService: InvestmentService, library: FaIconLibrary) {
    library.addIcons(faTimes);
  }

  onSubmit(): void {
    if (!this.investmentName || this.investmentAmount === null || this.monthlyEarning === null || this.investmentAmount <= 0) {
      // Basic validation
      alert('Por favor, complete los campos obligatorios y asegúrese que el capital invertido sea mayor a cero.');
      return;
    }

    // Check against current balance (optional, could also be done in service)
    const currentBalance = this.investmentService.getCurrentState().currentBalance;
    if (this.investmentAmount > currentBalance) {
        alert("No tienes suficiente capital para esta inversión. Saldo actual: $" + currentBalance.toLocaleString('es-ES', {maximumFractionDigits: 2}));
        return;
    }

    // Crear objeto de inversión con datos específicos según el tipo
    const investmentData: any = {
      name: this.investmentName,
      type: this.investmentType,
      amount: this.investmentAmount,
      monthlyEarning: this.monthlyEarning,
      description: this.investmentDescription,
    };

    // Agregar campos específicos según el tipo de inversión
    switch (this.investmentType) {
      case 'stocks':
        investmentData.tickerSymbol = this.tickerSymbol;
        investmentData.shares = this.shares;
        investmentData.acquisitionPercentage = this.acquisitionPercentage;
        break;
      case 'crypto':
        investmentData.cryptoName = this.cryptoName;
        investmentData.walletAddress = this.walletAddress;
        break;
      case 'real-estate':
        investmentData.propertyAddress = this.propertyAddress;
        investmentData.propertyType = this.propertyType;
        break;
      case 'bonds':
        investmentData.issuerName = this.issuerName;
        investmentData.maturityDate = this.maturityDate;
        investmentData.couponRate = this.couponRate;
        break;
      case 'business':
        investmentData.businessName = this.businessName;
        investmentData.stakePercentage = this.stakePercentage;
        break;
    }

    this.investmentService.addInvestment(investmentData);
    this.resetForm();
    this.closeModal.emit();
  }

  onCancel(): void {
    this.resetForm();
    this.closeModal.emit();
  }

  private resetForm(): void {
    // Resetear propiedades básicas
    this.investmentName = '';
    this.investmentType = 'stocks';
    this.investmentAmount = null;
    this.monthlyEarning = null;
    this.investmentDescription = '';

    // Resetear propiedades de acciones
    this.tickerSymbol = '';
    this.shares = null;
    this.acquisitionPercentage = null;

    // Resetear propiedades de criptomonedas
    this.cryptoName = '';
    this.walletAddress = '';

    // Resetear propiedades de bienes raíces
    this.propertyAddress = '';
    this.propertyType = '';

    // Resetear propiedades de bonos
    this.issuerName = '';
    this.maturityDate = '';
    this.couponRate = null;

    // Resetear propiedades de negocios
    this.businessName = '';
    this.stakePercentage = null;
  }
}
