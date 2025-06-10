import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Subscription } from 'rxjs';
import { InvestmentService } from '../../services/investment.service';
import { AppState } from '../../models/app-state.model';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faForward } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-capital-section',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule], // Add FontAwesomeModule
  templateUrl: './capital-section.html',
  styleUrls: ['./capital-section.css']
})
export class CapitalSectionComponent implements OnInit, OnDestroy {
  initialCapital: number = 0;
  currentMonth: number = 1;
  totalBalance: number = 0;
  monthlyEarnings: number = 0;
  totalInvested: number = 0;
  monthlyPerformance: number = 0;

  private stateSubscription!: Subscription;

  constructor(public investmentService: InvestmentService, library: FaIconLibrary) {
    library.addIcons(faForward); // Add specific icon
  }

  ngOnInit(): void {
    this.stateSubscription = this.investmentService.getState().subscribe((state: AppState) => {
      this.initialCapital = state.initialCapital;
      this.currentMonth = state.currentMonth;
      this.totalBalance = state.currentBalance;
      this.monthlyEarnings = state.monthlyEarnings;
      this.totalInvested = this.investmentService.getTotalInvested(); // Get dynamically or store in state
      this.monthlyPerformance = state.monthlyPerformance;
    });
    // To ensure totalInvested is also initialized correctly from the start
    this.totalInvested = this.investmentService.getTotalInvested();
  }

  ngOnDestroy(): void {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  onInitialCapitalChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const capital = parseFloat(value) || 0;
    this.investmentService.setInitialCapital(capital);
  }

  advanceMonth(): void {
    this.investmentService.advanceMonth();
  }
}
