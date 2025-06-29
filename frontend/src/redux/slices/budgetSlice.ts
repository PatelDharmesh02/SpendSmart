import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Budget } from "@/types/budget.type";
import { RootState } from "../store";

interface BudgetState {
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  budgets: [],
  isLoading: false,
  error: null,
};

const budgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {
    setBudgets: (state, action: PayloadAction<Budget[]>) => {
      state.budgets = action.payload;
    },
    addBudget: (state, action: PayloadAction<Budget>) => {
      state.budgets.push(action.payload);
    },
    removeBudget: (state, action: PayloadAction<string>) => {
      state.budgets = state.budgets.filter(
        (budget) => budget.id !== action.payload
      );
    },
    updateBudget: (state, action: PayloadAction<Budget>) => {
      state.budgets = state.budgets.map((budget) =>
        budget.id === action.payload.id ? action.payload : budget
      );
    },
    setBudgetLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setBudgetError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setBudgets,
  addBudget,
  removeBudget,
  updateBudget,
  setBudgetLoading,
  setBudgetError,
} = budgetSlice.actions;
export default budgetSlice.reducer;

export const budgetsSelector = (state: RootState) => state.budget.budgets;
export const budgetLoadingSelector = (state: RootState) =>
  state.budget.isLoading;
export const budgetErrorSelector = (state: RootState) => state.budget.error;
