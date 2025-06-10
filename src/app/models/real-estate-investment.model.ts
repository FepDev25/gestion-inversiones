import { Investment } from './investment.model';

export interface RealEstateInvestment extends Investment {
  type: 'real-estate';
  propertyAddress: string;
  propertyType: 'residential' | 'commercial' | 'industrial' | 'land';
}
