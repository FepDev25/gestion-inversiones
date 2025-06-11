import { BaseInvestment } from './base-investment.model';
import { Investment } from './investment.model';

export interface RealEstateInvestment extends BaseInvestment {
  type: 'real-estate';
  propertyAddress: string;
  propertyType: 'residential' | 'commercial' | 'industrial' | 'land';
}
