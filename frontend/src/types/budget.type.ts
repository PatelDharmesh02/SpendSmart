export type Budget = {
  id?: string;
  category: string;
  amount: number;
  month: string;
  created_at?: string;
};

export type BudgetResponse = Budget[];

export type BudgetCompare = {
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
};

export type BudgetCompareResponse = BudgetCompare[];

export type BudgetCreate = {
  category: string;
  amount: number;
  month: string;
};

export type BudgetUpdate = {
  id: string;
  category?: string;
  amount?: number;
  month?: string;
};

export type BudgetDelete = {
  id: string;
};
