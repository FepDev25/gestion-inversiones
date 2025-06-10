import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // CommonModule for basic Angular directives
import { InvestmentService } from './services/investment.service'; // Service
import { Investment } from './models/investment.model'; // Model

// Import all child components
import { CapitalSectionComponent } from './components/capital-section/capital-section.component';
import { InvestmentListComponent } from './components/investment-list/investment-list.component';
import { ChartsSectionComponent } from './components/charts-section/charts-section.component';
import { AddInvestmentModalComponent } from './components/modals/add-investment-modal/add-investment-modal.component';
import { EditEarningsModalComponent } from './components/modals/edit-earnings-modal/edit-earnings-modal.component';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    CapitalSectionComponent,
    InvestmentListComponent,
    ChartsSectionComponent,
    AddInvestmentModalComponent,
    EditEarningsModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'gestion-inversiones';
  isAddInvestmentModalVisible = false;
  isEditEarningsModalVisible = false;
  selectedInvestmentForEdit: Investment | null = null;

  // Inject InvestmentService if needed for any direct interactions, though most are encapsulated.
  constructor(private investmentService: InvestmentService) {}

  ngOnInit(): void {
    // Optional: Load initial state or perform actions on init
    // For example, if you wanted to ensure the service is initialized or log state
    // console.log('AppComponent initialized. Current state:', this.investmentService.getCurrentState());
  }

  // Methods to control AddInvestmentModal
  openAddInvestmentModal(): void {
    this.isAddInvestmentModalVisible = true;
  }

  closeAddInvestmentModal(): void {
    this.isAddInvestmentModalVisible = false;
  }

  // Methods to control EditEarningsModal
  openEditEarningsModal(investment: Investment): void {
    this.selectedInvestmentForEdit = investment;
    this.isEditEarningsModalVisible = true;
  }

  closeEditEarningsModal(): void {
    this.isEditEarningsModalVisible = false;
    this.selectedInvestmentForEdit = null;
  }
}
