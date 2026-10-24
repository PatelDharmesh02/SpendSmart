export type Transaction = {
  id: string;
  amount: number;
  desc?: string | null;
  merchant?: string | null;
  category: string;
  date: string;
  tx_type?: "income" | "expense" | string;
  category_source?: "user" | "ai" | string;
  ai_confidence?: number | null;
  status?: string;
};

export type TransactionCreate = {
  amount: number;
  desc?: string;
  merchant?: string;
  category: string;
  date: string;
  tx_type?: "income" | "expense";
};

export type TransactionDelete = {
  id: string;
};

export type AddTransactionResponse = {
  id: string;
  amount: number;
  category: string | "auto";
  date: string;
  desc: string;
  created_at: string;
};

export type TransactionMonthlySummary = {
  month: string;
  total_spent: number;
  category_breakdown: Record<string, number>;
}
