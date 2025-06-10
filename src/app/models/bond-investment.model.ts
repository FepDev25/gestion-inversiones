import { Investment } from './investment.model';

export interface BondInvestment extends Investment {
  type: 'bonds';
  issuerName: string;
  maturityDate: number; // Timestamp
  couponRate: number; // Example: 0.05 for 5%
}
