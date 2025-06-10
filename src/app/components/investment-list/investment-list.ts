import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { InvestmentService } from '../../services/investment.service';
import { Investment } from '../../models/investment.model';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { InvestmentCardComponent } from './investment-card/investment-card';

@Component({
  selector: 'app-investment-list',
  standalone: true,
  imports: [CommonModule, InvestmentCardComponent, FontAwesomeModule], // Add FontAwesomeModule
  templateUrl: './investment-list.component.html',
  styleUrls: ['./investment-list.component.css']
})
export class InvestmentListComponent implements OnInit, OnDestroy {
  investments: Investment[] = [];
  private stateSubscription!: Subscription;

  @Output() addInvestmentClick = new EventEmitter<void>();
  @Output() editInvestmentClick = new EventEmitter<Investment>(); // To bubble up to app-component

  constructor(private investmentService: InvestmentService, library: FaIconLibrary) {
    library.addIcons(faPlusCircle);
  }

  ngOnInit(): void {
    this.stateSubscription = this.investmentService.getState().subscribe(state => {
      this.investments = state.investments;
    });
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
