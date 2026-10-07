import { addDays, parseISO, toISO, todayISO } from "./dates";
import type { AppData, Transaction } from "./types";

export const EXPENSE_CATEGORIES = ["Alimentação", "Transporte", "Estudos", "Lazer", "Outros"] as const;

export const CATEGORY_STYLE: Record<string, { tone: string; emoji: string }> = {
  Alimentação: { tone: "blue", emoji: "🍽️" },
  Transporte: { tone: "green", emoji: "🚌" },
  Estudos: { tone: "purple", emoji: "📚" },
  Lazer: { tone: "pink", emoji: "🎮" },
  Outros: { tone: "yellow", emoji: "•••" },
  Receita: { tone: "green", emoji: "⬆️" },
};

export type Period = "30d" | "mes" | "mes-passado";

export function balance(d: Pick<AppData, "transactions" | "settings">): number {
  const total = d.transactions.reduce((a, t) => a + t.amount, d.settings.openingBalance);
  return Math.round(total * 100) / 100;
}

export function periodRange(p: Period): { from: string; to: string; label: string } {
  const today = todayISO();
  const t = parseISO(today);
  if (p === "30d") return { from: addDays(today, -29), to: today, label: "Últimos 30 dias" };
  if (p === "mes") return { from: toISO(new Date(t.getFullYear(), t.getMonth(), 1)), to: today, label: "Este mês" };
  const first = new Date(t.getFullYear(), t.getMonth() - 1, 1);
  const last = new Date(t.getFullYear(), t.getMonth(), 0);
  return { from: toISO(first), to: toISO(last), label: "Mês passado" };
}

export function inRange(tx: Transaction[], from: string, to: string): Transaction[] {
  return tx.filter((t) => t.date >= from && t.date <= to);
}

export function summarize(tx: Transaction[]) {
  const income = tx.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const spent = tx.filter((t) => t.amount < 0).reduce((a, t) => a - t.amount, 0);
  return { income, spent, saved: Math.max(0, income - spent) };
}

export function byCategory(tx: Transaction[]) {
  const expenses = tx.filter((t) => t.amount < 0);
  const total = expenses.reduce((a, t) => a - t.amount, 0);
  const map = new Map<string, number>();
  expenses.forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) - t.amount));
  return Array.from(map.entries())
    .map(([category, value]) => ({ category, value, pct: total ? Math.round((value / total) * 100) : 0 }))
    .sort((a, b) => b.value - a.value);
}

/** Gastos agrupados em N blocos de dias consecutivos dentro do período. */
export function spendBuckets(tx: Transaction[], from: string, to: string, buckets = 6) {
  const start = parseISO(from).getTime();
  const end = parseISO(to).getTime();
  const span = Math.max(1, Math.round((end - start) / 86400000) + 1);
  const size = Math.max(1, Math.ceil(span / buckets));
  const out = Array.from({ length: Math.ceil(span / size) }, (_, i) => ({
    label: addDays(from, i * size),
    value: 0,
  }));
  tx.filter((t) => t.amount < 0).forEach((t) => {
    const idx = Math.floor((parseISO(t.date).getTime() - start) / 86400000 / size);
    if (out[idx]) out[idx].value -= t.amount;
  });
  return out;
}

export function monthSpent(tx: Transaction[]): number {
  const { from, to } = periodRange("mes");
  return summarize(inRange(tx, from, to)).spent;
}
