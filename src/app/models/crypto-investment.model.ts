import { BaseInvestment } from './base-investment.model';
import { Investment } from './investment.model';

export interface CryptoInvestment extends BaseInvestment {
  type: 'crypto';
  cryptoName: string;
  walletAddress?: string;
}
