export type Transaction = {
  id: string;
  amount: number;
  desc: string;
  category: string | "auto";
  date: string;
};

export type TransactionCreate = {
  amount: number;
  desc: string;
  category: string | "auto";
  date: string;
};

export type TransactionUpdate = {
  id: string;
  amount?: number;
  desc?: string;
  category?: string | "auto";
  date?: string;
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
