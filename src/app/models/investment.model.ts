import { StockInvestment } from './stock-investment.model';
import { CryptoInvestment } from './crypto-investment.model';
import { RealEstateInvestment } from './real-estate-investment.model';
import { BondInvestment } from './bond-investment.model';
import { BusinessInvestment } from './business-investment.model';
import { OtherInvestment } from './other-investment.model';

// Base interface that specific investments will extend
export interface BaseInvestment {
  id: string;
  name: string;
  amount: number;
  monthlyEarning: number;
  description?: string;
  addedAt: number; // Month number when it was added
}

// Union type for all possible investment types
export type Investment =
  | StockInvestment
  | CryptoInvestment
  | RealEstateInvestment
  | BondInvestment
  | BusinessInvestment
  | OtherInvestment;

// Keep the old InvestmentType for now, might be useful for dropdowns,
// or decide later if it should be derived from the Investment union type keys.
export type InvestmentType = Investment['type'];

// Helper function to get all investment types
export const getAllInvestmentTypes = (): InvestmentType[] => {
    return ['stocks', 'real-estate', 'crypto', 'bonds', 'business', 'other'];
};
