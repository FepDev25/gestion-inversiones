import { Investment } from './investment.model';

export interface OtherInvestment extends Investment {
  type: 'other';
  // No specific fields for 'other' beyond the base Investment,
  // but description can be used for details.
}
