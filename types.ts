
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
}

export interface Summary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface Insight {
  title: string;
  suggestion: string;
  priority: 'low' | 'medium' | 'high';
}
