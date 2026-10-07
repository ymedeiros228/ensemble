const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const MESES_CURTOS = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
const DIAS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
export const DIAS_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function toISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(): string {
  return toISO(new Date());
}

export function addDays(iso: string, n: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function diffDays(a: string, b: string): number {
  const ms = parseISO(a).getTime() - parseISO(b).getTime();
  return Math.round(ms / 86400000);
}

export function daysUntil(iso: string): number {
  return diffDays(iso, todayISO());
}

export function monthName(m: number): string {
  return MESES[m];
}

export function weekdayName(iso: string): string {
  return DIAS[parseISO(iso).getDay()];
}

export function formatShort(iso: string): string {
  const d = parseISO(iso);
  return `${d.getDate()} de ${MESES_CURTOS[d.getMonth()]}`;
}

export function formatLong(iso: string): string {
  const d = parseISO(iso);
  return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

export function formatNumeric(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Rótulo relativo de prazo: Hoje, Amanhã, Sexta-feira ou dd/mm. */
export function dueLabel(iso: string): string {
  const n = daysUntil(iso);
  if (n === 0) return "Hoje";
  if (n === 1) return "Amanhã";
  if (n === -1) return "Ontem";
  if (n < 0) return `${Math.abs(n)} dias atrás`;
  if (n < 7) return weekdayName(iso);
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function brl(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
