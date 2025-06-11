import { BaseInvestment } from './base-investment.model';

export interface StockInvestment extends BaseInvestment {
  type: 'stocks';
  tickerSymbol: string;
  shares: number;
  acquisitionPercentage: number; // Example: 0.5 for 50%
}
