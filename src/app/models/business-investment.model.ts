import { Investment } from './investment.model';

export interface BusinessInvestment extends Investment {
  type: 'business';
  businessName: string;
  stakePercentage: number; // Example: 0.2 for 20%
}
