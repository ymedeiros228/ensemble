"use client";

import { useState } from "react";
import { BookOpen, Check, Flag, PiggyBank, Plus, Target, Trash2 } from "lucide-react";
import { Button, Card, Checkbox, EmptyState, Field, Modal, PageHeader, ProgressBar, SectionTitle, Stat } from "@/components/ui";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/ui-store";
import { brl, daysUntil, formatShort } from "@/lib/dates";

export default function MetasPage() {
  const studyGoals = useStore((s) => s.studyGoals);
  const updateStudyGoal = useStore((s) => s.updateStudyGoal);
  const removeStudyGoal = useStore((s) => s.removeStudyGoal);
  const addStudyGoal = useStore((s) => s.addStudyGoal);
  const finGoals = useStore((s) => s.finGoals);
  const depositFinGoal = useStore((s) => s.depositFinGoal);
  const removeFinGoal = useStore((s) => s.removeFinGoal);
  const personal = useStore((s) => s.personalGoals);
  const togglePersonal = useStore((s) => s.togglePersonalGoal);
  const removePersonal = useStore((s) => s.removePersonalGoal);
  const addPersonal = useStore((s) => s.addPersonalGoal);

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const done = studyGoals.filter((g) => g.progress >= 100).length + finGoals.filter((g) => g.saved >= g.target).length + personal.filter((g) => g.done).length;
  const total = studyGoals.length + finGoals.length + personal.length;

  return (
    <div>
      <PageHeader icon={Target} title="Metas" subtitle="Tudo o que você quer conquistar, em um só lugar." mood="comemorando" quote="Um passo de cada vez!" />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Stat label="Concluídas" value={`${done} de ${total}`} tone="green" icon={Check} />
        <Stat label="Em andamento" value={String(total - done)} tone="blue" icon={Flag} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <SectionTitle icon={BookOpen} title="Metas de estudo" action="Nova meta" onAction={() => setOpen(true)} />
          {studyGoals.length === 0 ? <EmptyState text="Nenhuma meta de estudo." action="Nova meta" onAction={() => setOpen(true)} /> : (
            <ul className="space-y-4">
              {studyGoals.map((g) => (
                <li key={g.id}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-bold text-ink truncate">{g.title}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="font-extrabold text-ink">{g.progress}%</span>
                      <button onClick={() => { removeStudyGoal(g.id); toast("Meta removida"); }} aria-label={`Excluir meta ${g.title}`} className="text-muted hover:text-[var(--pink-fg)]"><Trash2 size={16} aria-hidden /></button>
                    </span>
                  </div>
                  <ProgressBar value={g.progress} tone={g.color} label={g.title} />
                  <div className="flex items-center gap-2 mt-1.5">
                    <input type="range" min={0} max={100} step={5} value={g.progress} onChange={(e) => updateStudyGoal(g.id, { progress: Number(e.target.value) })} aria-label={`Progresso de ${g.title}`} className="flex-1 accent-[var(--brand)]" />
                    {g.targetDate && <span className="text-xs text-muted shrink-0">{daysUntil(g.targetDate) >= 0 ? `até ${formatShort(g.targetDate)}` : "prazo vencido"}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <SectionTitle icon={PiggyBank} title="Metas financeiras" action="Gerenciar" href="/financeiro" />
          {finGoals.length === 0 ? <EmptyState text="Nenhuma meta financeira." /> : (
            <ul className="space-y-4">
              {finGoals.map((g) => (
                <li key={g.id}>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-ink">{g.title}</span>
                    <span className="text-muted">{brl(g.saved)} / {brl(g.target)}</span>
                  </div>
                  <ProgressBar value={(g.saved / g.target) * 100} tone="green" label={g.title} />
                  <div className="flex gap-2 mt-2">
                    <Button variant="soft" className="!py-1.5" onClick={() => { depositFinGoal(g.id, 50); toast("Guardou R$ 50,00 🐷"); }}>+ R$ 50</Button>
                    <Button variant="ghost" className="!py-1.5" aria-label={`Excluir meta ${g.title}`} onClick={() => { removeFinGoal(g.id); toast("Meta removida"); }}><Trash2 size={16} aria-hidden /></Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <SectionTitle icon={Flag} title="Metas pessoais" />
        <form className="flex gap-2 mb-3" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { addPersonal(text.trim()); setText(""); toast("Meta adicionada"); } }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ex.: Ler 1 livro por mês" aria-label="Nova meta pessoal" />
          <Button type="submit" disabled={!text.trim()}><Plus size={18} aria-hidden /> Adicionar</Button>
        </form>
        {personal.length === 0 ? <EmptyState text="Nenhuma meta pessoal ainda." /> : (
          <ul className="space-y-2">
            {personal.map((g) => (
              <li key={g.id} className="flex items-center gap-3 rounded-2xl bg-surface2 p-3">
                <Checkbox checked={g.done} onChange={() => togglePersonal(g.id)} label={g.title} />
                <span className={`flex-1 ${g.done ? "line-through text-muted" : "text-ink font-semibold"}`}>{g.title}</span>
                <button onClick={() => removePersonal(g.id)} aria-label={`Excluir ${g.title}`} className="text-muted hover:text-[var(--pink-fg)]"><Trash2 size={18} aria-hidden /></button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {open && <StudyGoalModal onClose={() => setOpen(false)} onSave={(g) => { addStudyGoal({ ...g, progress: 0 }); toast("Meta criada! 🎯"); setOpen(false); }} />}
    </div>
  );
}

function StudyGoalModal({ onClose, onSave }: { onClose: () => void; onSave: (g: { title: string; color: string; targetDate?: string }) => void }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  return (
    <Modal open onClose={onClose} title="Nova meta de estudo">
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (title.trim()) onSave({ title: title.trim(), color: "blue", targetDate: date || undefined }); }}>
        <Field label="Meta"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Passar em Cálculo I" /></Field>
        <Field label="Prazo (opcional)"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Button type="submit" className="w-full" disabled={!title.trim()}>Criar meta</Button>
      </form>
    </Modal>
  );
}
