import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import * as Crypto from "expo-crypto";
import { Cache, CACHE_KEYS } from "@/lib/cache";
import type { Icon3DName } from "@/lib/brand";
import { localIsoDate } from "@/lib/dates";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  /** Always positive; the sign comes from `type`. */
  amount: number;
  category: string;
  note: string;
  /** Local date, YYYY-MM-DD. */
  date: string;
  createdAt: string;
}

export interface FinanceCategory {
  key: string;
  label: string;
  icon: Icon3DName;
}

export const EXPENSE_CATEGORIES: FinanceCategory[] = [
  { key: "home", label: "Casa", icon: "lock" },
  { key: "groceries", label: "Spesa", icon: "teaCup" },
  { key: "transport", label: "Trasporti", icon: "rocket" },
  { key: "fun", label: "Svago", icon: "star" },
  { key: "health", label: "Salute", icon: "heart" },
  { key: "sport", label: "Sport", icon: "gym" },
  { key: "subscriptions", label: "Abbonamenti", icon: "card" },
  { key: "other-out", label: "Altro", icon: "folder" },
];

export const INCOME_CATEGORIES: FinanceCategory[] = [
  { key: "salary", label: "Stipendio", icon: "moneyBag" },
  { key: "extra", label: "Extra", icon: "euro" },
  { key: "gift", label: "Regali", icon: "medal" },
  { key: "other-in", label: "Altro", icon: "folder" },
];

const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategory(key: string): FinanceCategory {
  return ALL_CATEGORIES.find((c) => c.key === key) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}

export interface AddTransactionInput {
  type: TransactionType;
  amount: number;
  category: string;
  note?: string;
  date?: string;
}

export interface MonthSummary {
  income: number;
  expense: number;
  balance: number;
  byCategory: { key: string; total: number }[];
}

type FinanceContextType = {
  transactions: Transaction[];
  addTransaction: (input: AddTransactionInput) => Transaction;
  removeTransaction: (id: string) => void;
  /** Net of every transaction ever logged. */
  totalBalance: number;
  summaryFor: (monthKey: string) => MonthSummary;
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within a FinanceProvider");
  return ctx;
}

function sortTx(list: Transaction[]): Transaction[] {
  return [...list].sort((a, b) =>
    a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date)
  );
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(
    () => Cache.get<Transaction[]>(CACHE_KEYS.FINANCE_TRANSACTIONS) ?? []
  );

  const persist = useCallback((next: Transaction[]) => {
    Cache.set(CACHE_KEYS.FINANCE_TRANSACTIONS, next);
    return next;
  }, []);

  const addTransaction = useCallback(
    (input: AddTransactionInput) => {
      const created: Transaction = {
        id: Crypto.randomUUID(),
        type: input.type,
        amount: Math.abs(input.amount),
        category: input.category,
        note: input.note?.trim() ?? "",
        date: input.date ?? localIsoDate(),
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => persist(sortTx([created, ...prev])));
      return created;
    },
    [persist]
  );

  const removeTransaction = useCallback(
    (id: string) => setTransactions((prev) => persist(prev.filter((t) => t.id !== id))),
    [persist]
  );

  const totalBalance = useMemo(
    () => transactions.reduce((acc, t) => acc + (t.type === "income" ? t.amount : -t.amount), 0),
    [transactions]
  );

  const summaryFor = useCallback(
    (key: string): MonthSummary => {
      let income = 0;
      let expense = 0;
      const cat = new Map<string, number>();
      for (const t of transactions) {
        if (!t.date.startsWith(key)) continue;
        if (t.type === "income") income += t.amount;
        else {
          expense += t.amount;
          cat.set(t.category, (cat.get(t.category) ?? 0) + t.amount);
        }
      }
      return {
        income,
        expense,
        balance: income - expense,
        byCategory: [...cat.entries()]
          .map(([k, total]) => ({ key: k, total }))
          .sort((a, b) => b.total - a.total),
      };
    },
    [transactions]
  );

  return (
    <FinanceContext.Provider
      value={{ transactions, addTransaction, removeTransaction, totalBalance, summaryFor }}
    >
      {children}
    </FinanceContext.Provider>
  );
}
