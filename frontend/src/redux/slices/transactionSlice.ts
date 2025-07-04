import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Transaction } from "@/types/transaction.type";
import { RootState } from "@/redux/store";

export interface TransactionState {
  transactions: Transaction[];
  transactionLoading: boolean;
  transactionError: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  transactionLoading: false,
  transactionError: null,
};

export const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.push(action.payload);
    },
    removeTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(
        (transaction) => transaction.id !== action.payload
      );
    },
    setTransactionLoading: (state, action: PayloadAction<boolean>) => {
      state.transactionLoading = action.payload;
    },
    setTransactionError: (state, action: PayloadAction<string | null>) => {
      state.transactionError = action.payload;
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions = state.transactions.map((transaction) =>
        transaction.id === action.payload.id ? action.payload : transaction
      );
    },
  },
});

export const {
  addTransaction,
  removeTransaction,
  updateTransaction,
  setTransactionLoading,
  setTransactionError,
} = transactionSlice.actions;
export default transactionSlice.reducer;

export const selectTransactions = (state: RootState) => state.transactions;
export const selectTransactionLoading = (state: RootState) =>
  state.transactions.transactionLoading;
export const selectTransactionError = (state: RootState) =>
  state.transactions.transactionError;
