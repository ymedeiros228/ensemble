"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button, Checkbox, Chip, Field, Modal, cx } from "./ui";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/ui-store";
import { CATEGORIES, type CalEvent, type Category, type Task } from "@/lib/types";
import { dueLabel, todayISO } from "@/lib/dates";
import { EXPENSE_CATEGORIES } from "@/lib/finance";

export const CATEGORY_TONE: Record<Category, string> = {
  Estudos: "purple",
  Trabalho: "yellow",
  "Prova da escola": "pink",
  Simulado: "blue",
  Escola: "teal",
  Pessoal: "green",
};

/** Modal para criar uma tarefa. */
export function TaskModal({ open, onClose, defaultDue }: { open: boolean; onClose: () => void; defaultDue?: string }) {
  const addTask = useStore((s) => s.addTask);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Estudos");
  const [due, setDue] = useState(defaultDue ?? todayISO());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({ title: title.trim(), category, due });
    toast("Tarefa criada ✅");
    setTitle("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Nova tarefa">
      <form onSubmit={submit} className="space-y-3">
        <Field label="O que precisa ser feito?"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Resolver lista de Química" required /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Categoria">
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Prazo"><input type="date" value={due} onChange={(e) => setDue(e.target.value)} required /></Field>
        </div>
        <Button type="submit" className="w-full">Criar tarefa</Button>
      </form>
    </Modal>
  );
}

/** Modal para criar/editar/excluir compromisso. */
export function EventModal({ open, onClose, event, defaultDate }: { open: boolean; onClose: () => void; event?: CalEvent | null; defaultDate?: string }) {
  const addEvent = useStore((s) => s.addEvent);
  const updateEvent = useStore((s) => s.updateEvent);
  const removeEvent = useStore((s) => s.removeEvent);
  return open ? <EventForm key={event?.id ?? "new"} onClose={onClose} event={event} defaultDate={defaultDate} {...{ addEvent, updateEvent, removeEvent }} /> : null;
}

function EventForm({ onClose, event, defaultDate, addEvent, updateEvent, removeEvent }: {
  onClose: () => void; event?: CalEvent | null; defaultDate?: string;
  addEvent: (e: Omit<CalEvent, "id">) => void; updateEvent: (id: string, e: Partial<Omit<CalEvent, "id">>) => void; removeEvent: (id: string) => void;
}) {
  const [title, setTitle] = useState(event?.title ?? "");
  const [date, setDate] = useState(event?.date ?? defaultDate ?? todayISO());
  const [start, setStart] = useState(event?.start ?? "09:00");
  const [end, setEnd] = useState(event?.end ?? "10:00");
  const [category, setCategory] = useState<Category>(event?.category ?? "Estudos");
  const [notes, setNotes] = useState(event?.notes ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (end <= start) {
      toast("O horário final deve ser depois do inicial");
      return;
    }
    const data = { title: title.trim(), date, start, end, category, notes: notes.trim() };
    if (event) updateEvent(event.id, data);
    else addEvent(data);
    toast(event ? "Compromisso atualizado" : "Compromisso criado 📅");
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={event ? "Editar compromisso" : "Novo compromisso"}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Título"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Aula de Biologia" required /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></Field>
          <Field label="Categoria">
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Início"><input type="time" value={start} onChange={(e) => setStart(e.target.value)} required /></Field>
          <Field label="Fim"><input type="time" value={end} onChange={(e) => setEnd(e.target.value)} required /></Field>
        </div>
        <Field label="Anotações"><textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" /></Field>
        <div className="flex gap-2">
          {event && (
            <Button variant="danger" onClick={() => { removeEvent(event.id); toast("Compromisso excluído"); onClose(); }}>
              <Trash2 size={16} aria-hidden /> Excluir
            </Button>
          )}
          <Button type="submit" className="flex-1">{event ? "Salvar" : "Criar compromisso"}</Button>
        </div>
      </form>
    </Modal>
  );
}

/** Modal para registrar receita ou gasto. */
export function TransactionModal({ open, onClose, kind }: { open: boolean; onClose: () => void; kind: "receita" | "gasto" }) {
  const add = useStore((s) => s.addTransaction);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState<string>("Alimentação");
  const [date, setDate] = useState(todayISO());
  const income = kind === "receita";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(value.replace(",", "."));
    if (!title.trim() || !(n > 0)) {
      toast("Informe um valor maior que zero");
      return;
    }
    add({ title: title.trim(), note: note.trim(), amount: income ? n : -n, category: income ? "Receita" : category, date });
    toast(income ? "Receita adicionada 💰" : "Gasto registrado");
    setTitle(""); setNote(""); setValue("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={income ? "Adicionar receita" : "Registrar gasto"}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Descrição"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={income ? "Ex.: Pix recebido" : "Ex.: Lanche"} required /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Valor (R$)"><input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0,00" required /></Field>
          <Field label="Data"><input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} required /></Field>
        </div>
        {!income && (
          <Field label="Categoria">
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
        )}
        <Field label={income ? "De quem?" : "Onde?"}><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Opcional" /></Field>
        <Button type="submit" className="w-full">{income ? "Adicionar receita" : "Registrar gasto"}</Button>
      </form>
    </Modal>
  );
}

/** Linha de tarefa com checkbox. */
export function TaskRow({ task, showCategory = false, onDelete }: { task: Task; showCategory?: boolean; onDelete?: () => void }) {
  const toggle = useStore((s) => s.toggleTask);
  const late = !task.done && dueLabel(task.due).includes("atrás");
  return (
    <li className="flex items-center gap-3 py-2.5 border-b border-line last:border-0">
      <Checkbox checked={task.done} onChange={() => { toggle(task.id); if (!task.done) toast("Tarefa concluída! +10 XP ⭐"); }} label={`Concluir: ${task.title}`} />
      <span className={cx("flex-1 min-w-0 text-sm sm:text-[0.95rem] font-semibold truncate", task.done ? "line-through text-muted" : "text-ink")}>{task.title}</span>
      {showCategory && <Chip tone={CATEGORY_TONE[task.category]} className="hidden sm:inline-flex">{task.category}</Chip>}
      <span className={cx("text-xs sm:text-sm shrink-0", late ? "text-danger font-bold" : "text-muted")}>{dueLabel(task.due)}</span>
      {onDelete && (
        <button onClick={onDelete} aria-label={`Excluir: ${task.title}`} className="text-muted hover:text-danger p-1"><Trash2 size={16} aria-hidden /></button>
      )}
    </li>
  );
}
