import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Investment } from '../../../models/investment.model';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChartLine, faHome, faCoins, faFileInvoiceDollar, faBriefcase, faPiggyBank, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-investment-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule], // Add FontAwesomeModule
  templateUrl: './investment-card.component.html',
  styleUrls: ['./investment-card.component.css']
})
export class InvestmentCardComponent {
  @Input() investment!: Investment;
  @Output() editEarnings = new EventEmitter<Investment>();
  @Output() removeInvestment = new EventEmitter<string>();

  constructor(library: FaIconLibrary) {
    library.addIcons(faChartLine, faHome, faCoins, faFileInvoiceDollar, faBriefcase, faPiggyBank, faEdit, faTrashAlt);
  }

  getIconName(): string { // Renamed from getIconClass
    switch (this.investment.type) {
      case 'stocks': return 'chart-line';
      case 'real-estate': return 'home';
      case 'crypto': return 'coins';
      case 'bonds': return 'file-invoice-dollar';
      case 'business': return 'briefcase';
      default: return 'piggy-bank';
    }
  }

  getBgColorClass(): string {
    switch (this.investment.type) {
      case 'stocks': return 'bg-blue-100';
      case 'real-estate': return 'bg-green-100';
      case 'crypto': return 'bg-yellow-100';
      case 'bonds': return 'bg-purple-100';
      case 'business': return 'bg-amber-100';
      default: return 'bg-gray-100';
    }
  }

  getTextColorClass(): string {
    switch (this.investment.type) {
      case 'stocks': return 'text-blue-600';
      case 'real-estate': return 'text-green-600';
      case 'crypto': return 'text-yellow-600';
      case 'bonds': return 'text-purple-600';
      case 'business': return 'text-amber-600';
      default: return 'text-gray-600';
    }
  }

  getTypeDisplayName(): string {
    const types: { [key: string]: string } = {
      'stocks': 'Acciones',
      'real-estate': 'Bienes Raíces',
      'crypto': 'Cripto',
      'bonds': 'Bonos',
      'business': 'Negocio',
      'other': 'Otro'
    };
    return types[this.investment.type] || 'Otro';
  }

  getROI(): number {
    if (!this.investment || this.investment.amount === 0) return 0; // Guard against undefined or zero amount
    return parseFloat(((this.investment.monthlyEarning / this.investment.amount) * 100).toFixed(2));
  }

  onEdit(): void {
    this.editEarnings.emit(this.investment);
  }

  onRemove(): void {
    // Confirmation logic can be moved to a service or parent if preferred for consistency
    if (confirm("¿Estás seguro de que quieres eliminar esta inversión?")) {
      this.removeInvestment.emit(this.investment.id);
    }
  }
}
