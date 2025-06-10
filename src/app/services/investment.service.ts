import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppState, MonthlyHistory } from '../models/app-state.model';
import { Investment, StockInvestment, CryptoInvestment, RealEstateInvestment, BondInvestment, BusinessInvestment, OtherInvestment } from '../models/investment.model';

const DEFAULT_STATE: AppState = {
  initialCapital: 0,
  currentBalance: 0,
  investments: [],
  currentMonth: 1,
  monthlyEarnings: 0,
  monthlyPerformance: 0,
  history: [], // Will be initialized with month 1 in constructor
};

@Injectable({
  providedIn: 'root',
})
export class InvestmentService {
  private readonly storageKey = 'investmentApp';
  private _state$: BehaviorSubject<AppState>;

  constructor() {
    const savedStateString = localStorage.getItem(this.storageKey);
    let initialState: AppState;

    if (savedStateString) {
      initialState = JSON.parse(savedStateString);
      // Ensure history is not empty and contains month 1 data
      if (!initialState.history || initialState.history.length === 0) {
        initialState.history = [{
          month: 1,
          balance: initialState.initialCapital,
          monthlyEarnings: 0,
        }];
      } else {
        const month1History = initialState.history.find(h => h.month === 1);
        if (month1History) {
          // If initialCapital from root state differs from month 1 history balance, update history
          // This could happen if initialCapital was changed after first save.
          // We trust the initialState.initialCapital as the source of truth for current initialCapital.
          month1History.balance = initialState.initialCapital;
        } else {
          // Month 1 history is missing, add it and re-sort.
          initialState.history.unshift({
            month: 1,
            balance: initialState.initialCapital,
            monthlyEarnings: 0,
          });
          initialState.history.sort((a, b) => a.month - b.month);
        }
      }
    } else {
      initialState = {
        ...DEFAULT_STATE,
        history: [{ month: 1, balance: DEFAULT_STATE.initialCapital, monthlyEarnings: 0 }]
      };
    }
    this._state$ = new BehaviorSubject<AppState>(initialState);
    // Perform an initial summary calculation for the loaded/default state
    this.updateCurrentMonthSummary(false); // Don't save again, constructor handles initial load
  }

  private saveState(state: AppState): void {
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  getState(): Observable<AppState> {
    return this._state$.asObservable();
  }

  getCurrentState(): AppState {
    return this._state$.getValue();
  }

  setInitialCapital(capital: number): void {
    const currentState = this.getCurrentState();
    let newBalance = currentState.currentBalance;
    const historyClone = JSON.parse(JSON.stringify(currentState.history)); // Deep clone for history modification

    if (currentState.investments.length === 0 && currentState.currentMonth === 1) {
      newBalance = capital;
      const month1Index = historyClone.findIndex((h: { month: number; }) => h.month === 1);
      if (month1Index !== -1) {
        historyClone[month1Index].balance = capital;
      }
      // If month1Index is -1, constructor should have handled it, but this is safer.
    } else {
      // If investments exist or month > 1, the change in initial capital is more complex.
      // Simplest model: adjust current balance by the difference.
      // This implies 'initial capital' is a value that can be retrospectively changed.
      const diff = capital - currentState.initialCapital;
      newBalance += diff;
      // Adjust all history balances by this difference as well, as their starting point changed.
      // This is a significant operation and implies a full recalculation might be better in a real app.
      historyClone.forEach((h: { balance: number; }) => h.balance += diff);
    }

    const newState: AppState = {
      ...currentState,
      initialCapital: capital,
      currentBalance: newBalance,
      history: historyClone,
    };
    this._state$.next(newState);
    this.saveState(newState);
    this.updateCurrentMonthSummary(true); // Recalculate performance etc.
  }

  addInvestment(investmentData: Omit<StockInvestment | CryptoInvestment | RealEstateInvestment | BondInvestment | BusinessInvestment | OtherInvestment, 'id' | 'addedAt'>): void {
    const currentState = this.getCurrentState();
    if (investmentData.amount > currentState.currentBalance) {
      alert('No tienes suficiente capital para esta inversión');
      return;
    }

    const newInvestment: Investment = { // Explicitly type newInvestment with the union type
      ...investmentData,
      id: Date.now().toString(),
      addedAt: currentState.currentMonth,
    };

    const newState: AppState = {
      ...currentState,
      investments: [...currentState.investments, newInvestment],
      currentBalance: currentState.currentBalance - newInvestment.amount,
    };
    this._state$.next(newState);
    // Note: saveState and updateCurrentMonthSummary will be called by the public method that calls this if needed.
    // However, for addInvestment, we usually want immediate persistence and summary update.
    this.saveState(newState);
    this.updateCurrentMonthSummary(true);
  }

  updateInvestmentEarnings(investmentId: string, newMonthlyEarning: number): void {
    const currentState = this.getCurrentState();
    const updatedInvestments = currentState.investments.map((inv) =>
      inv.id === investmentId ? { ...inv, monthlyEarning: newMonthlyEarning } : inv
    );
    const newState: AppState = { ...currentState, investments: updatedInvestments };
    this._state$.next(newState);
    this.saveState(newState);
    this.updateCurrentMonthSummary(true);
  }

  removeInvestment(investmentId: string): void {
    const currentState = this.getCurrentState();
    const investmentToRemove = currentState.investments.find(inv => inv.id === investmentId);
    if (!investmentToRemove) return;

    const updatedInvestments = currentState.investments.filter(inv => inv.id !== investmentId);
    const newState: AppState = {
      ...currentState,
      investments: updatedInvestments,
      currentBalance: currentState.currentBalance + investmentToRemove.amount,
    };
    this._state$.next(newState);
    this.saveState(newState);
    this.updateCurrentMonthSummary(true);
  }

  advanceMonth(): void {
    let currentState = this.getCurrentState(); // Get state before any modifications

    if (currentState.initialCapital === 0 && currentState.investments.length === 0 && currentState.currentMonth === 1 && currentState.currentBalance === 0) {
      alert("Debes ingresar un capital inicial o realizar una inversión para avanzar el mes.");
      return;
    }

    // Finalize earnings for the month that is ending (currentMonth)
    const earningsThisMonth = currentState.investments.reduce((sum, inv) => sum + inv.monthlyEarning, 0);
    const newBalanceAfterEarnings = currentState.currentBalance + earningsThisMonth;

    // Update history for the month that just ENDED
    const historyClone = JSON.parse(JSON.stringify(currentState.history));
    const currentMonthHistoryIndex = historyClone.findIndex((h: { month: number; }) => h.month === currentState.currentMonth);

    if (currentMonthHistoryIndex !== -1) {
      historyClone[currentMonthHistoryIndex].monthlyEarnings = earningsThisMonth;
      // Balance in history is EOM, so it's after this month's earnings are added.
      historyClone[currentMonthHistoryIndex].balance = newBalanceAfterEarnings;
    } else {
      // Should not happen if constructor and previous advances worked. Defensive.
      historyClone.push({
        month: currentState.currentMonth,
        balance: newBalanceAfterEarnings,
        monthlyEarnings: earningsThisMonth,
      });
      historyClone.sort((a: { month: number; },b: { month: number; }) => a.month - b.month);
    }

    // Prepare for the NEW month
    const newMonthNumber = currentState.currentMonth + 1;

    const newHistoryEntryForNewMonth: MonthlyHistory = {
      month: newMonthNumber,
      balance: newBalanceAfterEarnings, // This is the BOM balance for the new month
      monthlyEarnings: 0, // Earnings for the new month will be calculated as it progresses or by next advanceMonth
    };
    historyClone.push(newHistoryEntryForNewMonth);
    historyClone.sort((a: { month: number; },b: { month: number; }) => a.month - b.month);


    const newState: AppState = {
      ...currentState, // carry over initialCapital, investments
      currentMonth: newMonthNumber,
      currentBalance: newBalanceAfterEarnings,
      history: historyClone,
      // monthlyEarnings and monthlyPerformance will be updated by updateCurrentMonthSummary for the new month
      monthlyEarnings: 0, // Reset for the new month, will be updated by updateCurrentMonthSummary
      monthlyPerformance: 0, // Reset for the new month
    };

    this._state$.next(newState);
    this.saveState(newState); // Save the state reflecting the new month
    this.updateCurrentMonthSummary(true); // Now calculate and save summary for the *newly started* month
  }

  private updateCurrentMonthSummary(save: boolean): void {
    const currentState = this.getCurrentState();
    const monthlyEarningsFromInvestments = currentState.investments.reduce((sum, inv) => sum + inv.monthlyEarning, 0);
    const totalInvested = currentState.investments.reduce((sum, inv) => sum + inv.amount, 0);
    const monthlyPerformance = totalInvested > 0 ? parseFloat(((monthlyEarningsFromInvestments / totalInvested) * 100).toFixed(2)) : 0;

    const updatedState: AppState = {
      ...currentState,
      monthlyEarnings: monthlyEarningsFromInvestments,
      monthlyPerformance: monthlyPerformance,
    };

    // Also update the current month's entry in history if it exists (it should)
    // This is for the "live" view of the current month's projected earnings/performance
    const historyClone = JSON.parse(JSON.stringify(updatedState.history));
    const currentMonthHistoryIdx = historyClone.findIndex((h: { month: number; }) => h.month === updatedState.currentMonth);
    if (currentMonthHistoryIdx !== -1) {
        // The balance in history for the *current, ongoing* month should reflect the *current* balance.
        // Earnings are what's projected for this month.
        historyClone[currentMonthHistoryIdx].monthlyEarnings = monthlyEarningsFromInvestments;
        // historyClone[currentMonthHistoryIdx].balance = updatedState.currentBalance; // Balance is updated by advanceMonth or setInitialCapital
    }
    updatedState.history = historyClone;


    this._state$.next(updatedState);
    if (save) {
      this.saveState(updatedState);
    }
  }

  getTotalInvested(): number {
    return this.getCurrentState().investments.reduce((sum, inv) => sum + inv.amount, 0);
  }
}
