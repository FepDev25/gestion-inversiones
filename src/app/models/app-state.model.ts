import { Investment } from './investment.model';

export interface MonthlyHistory {
  month: number;
  balance: number;
  monthlyEarnings: number;
}

export interface AppState {
  initialCapital: number;
  currentBalance: number;
  investments: Investment[];
  currentMonth: number;
  monthlyEarnings: number;
  monthlyPerformance: number;
  history: MonthlyHistory[];
}
