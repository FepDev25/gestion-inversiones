import { Investment } from './investment.model';

export interface CryptoInvestment extends Investment {
  type: 'crypto';
  cryptoName: string;
  walletAddress?: string;
}
