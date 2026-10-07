"use client";

import { useMemo, useState } from "react";
import { Copy, FileText, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button, Card, Chip, EmptyState, Field, Modal } from "@/components/ui";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/ui-store";
import { formatShort } from "@/lib/dates";
import type { Summary } from "@/lib/types";

function SubjectSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const subjects = useStore((s) => s.subjects);
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} required>
      <option value="" disabled>Escolha a matéria</option>
      {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
    </select>
  );
}

export function SummariesTab() {
  const summaries = useStore((s) => s.summaries);
  const subjects = useStore((s) => s.subjects);
  const save = useStore((s) => s.saveSummary);
  const remove = useStore((s) => s.removeSummary);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Summary | "new" | null>(null);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return summaries.filter((s) => !t || s.title.toLowerCase().includes(t) || s.body.toLowerCase().includes(t));
  }, [summaries, q]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <input className="!pl-11 !rounded-full" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar nos resumos..." aria-label="Buscar nos resumos" />
        </div>
        <Button onClick={() => setEditing("new")} disabled={subjects.length === 0}><Plus size={16} aria-hidden /> Novo resumo</Button>
      </div>
      {subjects.length === 0 && <p className="text-sm text-muted mb-3">Adicione uma matéria primeiro para criar resumos.</p>}
      {list.length === 0 ? (
        <Card><EmptyState text="Nenhum resumo encontrado." /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {list.map((s) => {
            const subj = subjects.find((x) => x.id === s.subjectId);
            return (
              <Card key={s.id} as="article" className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-extrabold text-ink flex items-center gap-2"><FileText size={18} className="text-brand shrink-0" aria-hidden />{s.title}</h3>
                  {subj && <Chip tone={subj.color}>{subj.name}</Chip>}
                </div>
                <p className="text-sm text-body whitespace-pre-line line-clamp-5">{s.body}</p>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="text-xs text-muted">Atualizado em {formatShort(s.updatedAt)}</span>
                  <span className="flex gap-1">
                    <button onClick={() => setEditing(s)} aria-label={`Editar ${s.title}`} className="p-2 rounded-xl hover:bg-surface2 text-brand"><Pencil size={16} /></button>
                    <button onClick={() => { remove(s.id); toast("Resumo excluído"); }} aria-label={`Excluir ${s.title}`} className="p-2 rounded-xl hover:bg-surface2 text-danger"><Trash2 size={16} /></button>
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {editing && <SummaryForm key={editing === "new" ? "new" : editing.id} summary={editing === "new" ? null : editing} onClose={() => setEditing(null)} save={save} />}
    </div>
  );
}

function SummaryForm({ summary, onClose, save }: { summary: Summary | null; onClose: () => void; save: (s: Omit<Summary, "id" | "updatedAt"> & { id?: string }) => void }) {
  const [title, setTitle] = useState(summary?.title ?? "");
  const [subjectId, setSubjectId] = useState(summary?.subjectId ?? "");
  const [body, setBody] = useState(summary?.body ?? "");
  return (
    <Modal open onClose={onClose} title={summary ? "Editar resumo" : "Novo resumo"} wide>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim() || !subjectId) return;
          save({ id: summary?.id, title: title.trim(), subjectId, body });
          toast("Resumo salvo 📚");
          onClose();
        }}
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Título"><input value={title} onChange={(e) => setTitle(e.target.value)} required /></Field>
          <Field label="Matéria"><SubjectSelect value={subjectId} onChange={setSubjectId} /></Field>
        </div>
        <Field label="Conteúdo"><textarea rows={10} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Escreva com suas palavras..." /></Field>
        <Button type="submit" className="w-full">Salvar resumo</Button>
      </form>
    </Modal>
  );
}

export function FormulasTab() {
  const formulas = useStore((s) => s.formulas);
  const subjects = useStore((s) => s.subjects);
  const add = useStore((s) => s.addFormula);
  const remove = useStore((s) => s.removeFormula);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [expr, setExpr] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Fórmula copiada 📋");
    } catch {
      toast("Não foi possível copiar");
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setOpen(true)} disabled={subjects.length === 0}><Plus size={16} aria-hidden /> Nova fórmula</Button>
      </div>
      {formulas.length === 0 ? <Card><EmptyState text="Nenhuma fórmula salva ainda." /></Card> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {formulas.map((f) => {
            const subj = subjects.find((x) => x.id === f.subjectId);
            return (
              <Card key={f.id} as="article">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-extrabold text-ink">{f.title}</h3>
                  {subj && <Chip tone={subj.color}>{subj.name}</Chip>}
                </div>
                <p className="rounded-2xl bg-brandsoft/60 px-4 py-4 text-center text-lg font-bold text-ink break-words">{f.expr}</p>
                <div className="flex justify-end gap-1 mt-2">
                  <button onClick={() => copy(f.expr)} aria-label={`Copiar ${f.title}`} className="p-2 rounded-xl hover:bg-surface2 text-brand"><Copy size={16} /></button>
                  <button onClick={() => remove(f.id)} aria-label={`Excluir ${f.title}`} className="p-2 rounded-xl hover:bg-surface2 text-danger"><Trash2 size={16} /></button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Nova fórmula">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !expr.trim() || !subjectId) return;
            add({ title: title.trim(), expr: expr.trim(), subjectId });
            toast("Fórmula salva");
            setTitle(""); setExpr(""); setOpen(false);
          }}
        >
          <Field label="Nome"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Energia cinética" required /></Field>
          <Field label="Fórmula"><input value={expr} onChange={(e) => setExpr(e.target.value)} placeholder="Ex.: Ec = m · v² / 2" required /></Field>
          <Field label="Matéria"><SubjectSelect value={subjectId} onChange={setSubjectId} /></Field>
          <Button type="submit" className="w-full">Salvar fórmula</Button>
        </form>
      </Modal>
    </div>
  );
}
