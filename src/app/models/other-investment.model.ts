import { BaseInvestment } from './base-investment.model';

export interface OtherInvestment extends BaseInvestment {
  type: 'other';
  // No specific fields for 'other' beyond the base Investment,
  // but description can be used for details.
}
