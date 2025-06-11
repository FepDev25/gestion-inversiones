import { StockInvestment } from './stock-investment.model';
import { CryptoInvestment } from './crypto-investment.model';
import { RealEstateInvestment } from './real-estate-investment.model';
import { BondInvestment } from './bond-investment.model';
import { BusinessInvestment } from './business-investment.model';
import { OtherInvestment } from './other-investment.model';

export type Investment =
  | StockInvestment
  | CryptoInvestment
  | RealEstateInvestment
  | BondInvestment
  | BusinessInvestment
  | OtherInvestment;

export type InvestmentType = Investment['type'];

export const getAllInvestmentTypes = (): InvestmentType[] => {
  return ['stocks', 'real-estate', 'crypto', 'bonds', 'business', 'other'];
};
