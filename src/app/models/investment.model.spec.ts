// src/app/models/investment.model.spec.ts
import { getAllInvestmentTypes, InvestmentType } from './investment.model';

describe('Investment Models', () => {
  describe('getAllInvestmentTypes', () => {
    it('should return all defined investment types', () => {
      const expectedTypes: InvestmentType[] = ['stocks', 'real-estate', 'crypto', 'bonds', 'business', 'other'];
      expect(getAllInvestmentTypes()).toEqual(expectedTypes);
    });

    it('should return a new array instance each time', () => {
      expect(getAllInvestmentTypes()).not.toBe(getAllInvestmentTypes());
    });
  });
});
