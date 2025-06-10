export interface Investment {
  id: string;
  name: string;
  type: 'stocks' | 'real-estate' | 'crypto' | 'bonds' | 'business' | 'other';
  amount: number;
  monthlyEarning: number;
  description?: string;
  addedAt: number; // Month number when it was added
}
