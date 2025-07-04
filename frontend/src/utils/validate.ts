import { Budget } from "@/types/budget.type";
import { TransactionCreate } from "@/types/transaction.type";
export const validateBudgetDetails = ({ category, amount, month }: Budget) => {
  if (!category || !amount || amount === 0 || !month) return false;
  const validMonth: boolean = isValidMonthYear(month);
  if (!validMonth) return false;
  return true;
};

export const isValidMonthYear = (monthYear: string) => {
  const [year, month] = monthYear.split("-");
  if (!year || !month) return false;
  return true;
};

export const validateTransactionDetails = ({
  amount,
  date,
}: TransactionCreate) => {
  if (!amount || !date) return false;
  if (amount <= 0) return false;
  return true;
};
