import { BaseInvestment } from "./base-investment.model";

export interface BondInvestment extends BaseInvestment {
  type: 'bonds';
  issuerName: string;
  maturityDate: number; // Timestamp
  couponRate: number;   // Example: 0.05 for 5%
}
