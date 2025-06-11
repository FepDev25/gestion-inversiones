export interface BaseInvestment {
  id: string;
  name: string;
  amount: number;
  monthlyEarning: number;
  description?: string;
  addedAt: number;
}
