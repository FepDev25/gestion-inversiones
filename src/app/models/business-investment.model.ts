import { BaseInvestment } from "./base-investment.model";

export interface BusinessInvestment extends BaseInvestment {
  type: 'business';
  businessName: string;
  stakePercentage: number; // Example: 0.2 for 20%
}
