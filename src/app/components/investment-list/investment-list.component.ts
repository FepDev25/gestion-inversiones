import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { InvestmentService } from '../../services/investment.service';
import { Investment, InvestmentType, getAllInvestmentTypes } from '../../models/investment.model'; // Added InvestmentType, getAllInvestmentTypes
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { InvestmentCardComponent } from './investment-card/investment-card.component';
import { FormsModule } from '@angular/forms'; // Import FormsModule

@Component({
  selector: 'app-investment-list',
  standalone: true,
  imports: [CommonModule, InvestmentCardComponent, FontAwesomeModule, FormsModule], // Add FormsModule
  templateUrl: './investment-list.html',
  styleUrls: ['./investment-list.css']
})
export class InvestmentListComponent implements OnInit, OnDestroy {
  investments: Investment[] = []; // This will hold the filtered list
  allInvestments: Investment[] = []; // To store the original full list
  investmentTypes: InvestmentType[] = getAllInvestmentTypes();
  selectedType: InvestmentType | 'all' = 'all';

  private stateSubscription!: Subscription;

  @Output() addInvestmentClick = new EventEmitter<void>();
  @Output() editInvestmentClick = new EventEmitter<Investment>(); // To bubble up to app-component

  constructor(private investmentService: InvestmentService, library: FaIconLibrary) {
    library.addIcons(faPlusCircle);
  }

  ngOnInit(): void {
    this.stateSubscription = this.investmentService.getState().subscribe(state => {
      this.allInvestments = state.investments;
      this.filterInvestments(); // Apply initial filter
    });
  }

  filterInvestments(): void {
    if (this.selectedType === 'all') {
      this.investments = [...this.allInvestments];
    } else {
      this.investments = this.allInvestments.filter(inv => inv.type === this.selectedType);
    }
  }

  onTypeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedType = selectElement.value as InvestmentType | 'all';
    this.filterInvestments();
  }

  ngOnDestroy(): void {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  onAddInvestment(): void {
    this.addInvestmentClick.emit();
  }

  // This method is called when InvestmentCardComponent emits editEarnings
  handleEditEarningsRequest(investment: Investment): void {
    this.editInvestmentClick.emit(investment); // Emit further up to AppComponent
  }

  // This method is called when InvestmentCardComponent emits removeInvestment
  handleRemoveInvestmentRequest(investmentId: string): void {
    // Direct call to service, or could also emit up if AppComponent needs to know
    this.investmentService.removeInvestment(investmentId);
  }
}
