
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string; // ISO string
  description: string;
}

export interface Reminder {
  id: string;
  billName: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  notified: boolean;
  notificationSound: 'default' | 'beep' | 'chime' | 'vibrate' | 'none';
  snoozeUntil?: string | null; // ISO string
}