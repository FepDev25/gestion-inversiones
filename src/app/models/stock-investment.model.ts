import { Investment } from './investment.model';

export interface StockInvestment extends Investment {
  type: 'stocks';
  tickerSymbol: string;
  shares: number;
  acquisitionPercentage: number; // Example: 0.5 for 50%
}
