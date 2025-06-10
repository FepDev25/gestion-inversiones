import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { InvestmentService } from '../../../services/investment.service';
import { Investment } from '../../../models/investment.model';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-edit-earnings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule], // Add FontAwesomeModule
  templateUrl: './edit-earnings-modal.component.html',
  styleUrls: ['./edit-earnings-modal.component.css']
})
export class EditEarningsModalComponent implements OnChanges {
  @Input() isVisible: boolean = false;
  @Input() investmentToEdit: Investment | null = null;
  @Output() closeModal = new EventEmitter<void>();

  currentInvestmentId: string | null = null;
  currentInvestmentName: string = '';
  currentInvestmentAmount: number = 0;
  currentMonthlyEarning: number = 0;
  newMonthlyEarning: number | null = null;

  constructor(private investmentService: InvestmentService, library: FaIconLibrary) {
    library.addIcons(faTimes);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['investmentToEdit'] && this.investmentToEdit) {
      this.currentInvestmentId = this.investmentToEdit.id;
      this.currentInvestmentName = this.investmentToEdit.name;
      this.currentInvestmentAmount = this.investmentToEdit.amount;
      this.currentMonthlyEarning = this.investmentToEdit.monthlyEarning;
      this.newMonthlyEarning = this.investmentToEdit.monthlyEarning; // Pre-fill with current earning
    }
  }

  onSubmit(): void {
    if (!this.currentInvestmentId || this.newMonthlyEarning === null || this.newMonthlyEarning < 0) {
      alert('Por favor, ingrese una nueva ganancia mensual válida.');
      return;
    }

    this.investmentService.updateInvestmentEarnings(this.currentInvestmentId, this.newMonthlyEarning);
    this.closeModal.emit();
    // No need to reset form here as it's pre-filled by ngOnChanges
  }

  onCancel(): void {
    this.closeModal.emit();
     // No need to reset form here
  }
}
