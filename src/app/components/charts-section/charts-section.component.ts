import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js/auto'; // Import from 'chart.js/auto'
import { InvestmentService } from '../../services/investment.service';
import { AppState, MonthlyHistory } from '../../models/app-state.model';
import { Investment } from '../../models/investment.model';

@Component({
  selector: 'app-charts-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './charts-section.component.html',
  styleUrls: ['./charts-section.component.css']
})
export class ChartsSectionComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('balanceChartCanvas') balanceChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('distributionChartCanvas') distributionChartCanvas!: ElementRef<HTMLCanvasElement>;

  private balanceChartInstance?: Chart;
  private distributionChartInstance?: Chart;
  private stateSubscription!: Subscription;

  constructor(private investmentService: InvestmentService) {
    Chart.register(...registerables); // Register all necessary components for Chart.js
  }

  ngOnInit(): void {
    this.stateSubscription = this.investmentService.getState().subscribe(state => {
      if (this.balanceChartCanvas && this.distributionChartCanvas) { // Ensure canvases are available
        this.updateCharts(state);
      }
    });
  }

  ngAfterViewInit(): void {
    // Initialize charts once the view (and canvas elements) are ready
    this.initCharts();
    // Subscribe to state updates to redraw charts if state changes after init
    // This is a bit redundant with ngOnInit, but ensures init happens first if view init is slow.
    // Consider if only one subscription point is needed, likely ngOnInit if canvases are always present.
    // For safety, let's ensure the initial state is used to draw charts for the first time.
     const initialState = this.investmentService.getCurrentState();
     this.updateCharts(initialState);
  }

  ngOnDestroy(): void {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    this.balanceChartInstance?.destroy();
    this.distributionChartInstance?.destroy();
  }

  private initCharts(): void {
    if (!this.balanceChartCanvas || !this.distributionChartCanvas) return;

    // Balance over time chart
    this.balanceChartInstance = new Chart(this.balanceChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: [], // Initial empty labels
        datasets: [{
          label: 'Balance Total ($)',
          data: [], // Initial empty data
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          tension: 0.4,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: context => `Balance: $${Number(context.raw).toLocaleString('es-ES', { maximumFractionDigits: 2 })}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => `$${Number(value).toLocaleString('es-ES', { maximumFractionDigits: 2 })}`
            }
          }
        }
      }
    });

    // Investment distribution chart
    this.distributionChartInstance = new Chart(this.distributionChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [], // Initial empty labels
        datasets: [{
          data: [], // Initial empty data
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)', 'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)', 'rgba(139, 92, 246, 0.7)',
            'rgba(217, 119, 6, 0.7)', 'rgba(156, 163, 175, 0.7)'
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)', 'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)', 'rgba(139, 92, 246, 1)',
            'rgba(217, 119, 6, 1)', 'rgba(156, 163, 175, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' },
          tooltip: {
            callbacks: {
              label: context => {
                const label = context.label || '';
                const value = Number(context.raw) || 0;
                const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                return `${label}: $${value.toLocaleString('es-ES', { maximumFractionDigits: 2 })} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  private updateCharts(state: AppState): void {
    if (!this.balanceChartInstance || !this.distributionChartInstance) {
      // If charts not initialized yet (e.g. ngAfterViewInit not called), try to initialize.
      // This can happen if state updates very quickly.
      if (this.balanceChartCanvas && this.distributionChartCanvas) {
        this.initCharts();
        if (!this.balanceChartInstance || !this.distributionChartInstance) return; // Still not ready, abort.
      } else {
        return; // Canvases not ready, abort.
      }
    }

    // Balance chart data
    // Use the history from the state. Ensure it's sorted by month.
    const sortedHistory = [...state.history].sort((a, b) => a.month - b.month);
    this.balanceChartInstance.data.labels = sortedHistory.map(entry => `Mes ${entry.month}`);
    this.balanceChartInstance.data.datasets[0].data = sortedHistory.map(entry => entry.balance);
    this.balanceChartInstance.update();

    // Distribution chart data
    const typeCounts = state.investments.reduce((acc, investment) => {
      const typeName = this.getInvestmentTypeDisplayName(investment.type);
      acc[typeName] = (acc[typeName] || 0) + investment.amount;
      return acc;
    }, {} as { [key: string]: number });

    this.distributionChartInstance.data.labels = Object.keys(typeCounts);
    this.distributionChartInstance.data.datasets[0].data = Object.values(typeCounts);
    this.distributionChartInstance.update();
  }

  private getInvestmentTypeDisplayName(typeKey: Investment['type']): string {
    const types: { [key: string]: string } = {
      'stocks': 'Acciones',
      'real-estate': 'B. Raíces',
      'crypto': 'Cripto',
      'bonds': 'Bonos',
      'business': 'Negocio',
      'other': 'Otros'
    };
    return types[typeKey] || 'Otros';
  }
}
