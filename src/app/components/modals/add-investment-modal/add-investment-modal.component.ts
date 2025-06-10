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

  investmentName: string = '';
  investmentType: Investment['type'] = 'stocks';
  investmentAmount: number | null = null;
  monthlyEarning: number | null = null;
  investmentDescription: string = '';

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


    this.investmentService.addInvestment({
      name: this.investmentName,
      type: this.investmentType,
      amount: this.investmentAmount,
      monthlyEarning: this.monthlyEarning,
      description: this.investmentDescription,
    });

    this.resetForm();
    this.closeModal.emit();
  }

  onCancel(): void {
    this.resetForm();
    this.closeModal.emit();
  }

  private resetForm(): void {
    this.investmentName = '';
    this.investmentType = 'stocks';
    this.investmentAmount = null;
    this.monthlyEarning = null;
    this.investmentDescription = '';
  }
}
