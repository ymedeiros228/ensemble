"use client";

import { useMemo, useState } from "react";
import { BookOpen, CalendarClock, GraduationCap, Plus, Trash2 } from "lucide-react";
import { Button, Card, Chip, EmptyState, Field, IconBadge, Modal, PageHeader, ProgressBar, SUBJECT_ICONS, SectionTitle, Stat } from "@/components/ui";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/ui-store";
import { daysUntil, formatShort, todayISO } from "@/lib/dates";

/** Nota normalizada em escala 0-10. */
const norm = (value: number, max: number) => (max > 0 ? (value / max) * 10 : 0);
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const fmt = (n: number | null) => (n === null ? "—" : n.toFixed(1).replace(".", ","));
const tone = (n: number | null) => (n === null ? "blue" : n >= 7 ? "green" : n >= 5 ? "yellow" : "pink");

export default function NotasPage() {
  const grades = useStore((s) => s.grades);
  const subjects = useStore((s) => s.subjects);
  const exams = useStore((s) => s.exams);
  const addGrade = useStore((s) => s.addGrade);
  const removeGrade = useStore((s) => s.removeGrade);
  const addExam = useStore((s) => s.addExam);
  const removeExam = useStore((s) => s.removeExam);

  const [gradeOpen, setGradeOpen] = useState(false);
  const [examOpen, setExamOpen] = useState(false);

  const overall = useMemo(() => avg(grades.map((g) => norm(g.value, g.max))), [grades]);
  const sortedExams = useMemo(() => [...exams].sort((a, b) => a.date.localeCompare(b.date)), [exams]);
  const upcoming = sortedExams.filter((e) => daysUntil(e.date) >= 0);

  return (
    <div>
      <PageHeader icon={GraduationCap} title="Notas" subtitle="Acompanhe suas médias e provas." mood="estudando" quote="Cada nota conta uma história!" />

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Stat label="Média geral" value={fmt(overall)} tone={tone(overall) as "green"} />
        <Stat label="Notas lançadas" value={String(grades.length)} tone="purple" />
        <Stat label="Próximas provas" value={String(upcoming.length)} tone="orange" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <SectionTitle icon={BookOpen} title="Média por matéria" action="Lançar nota" onAction={() => setGradeOpen(true)} />
          {subjects.length === 0 ? (
            <EmptyState text="Cadastre matérias na aba Estudos para lançar notas." />
          ) : (
            <ul className="space-y-3">
              {subjects.map((s) => {
                const list = grades.filter((g) => g.subjectId === s.id);
                const m = avg(list.map((g) => norm(g.value, g.max)));
                const Icon = SUBJECT_ICONS[s.icon] ?? BookOpen;
                return (
                  <li key={s.id} className="flex items-center gap-3">
                    <IconBadge icon={Icon} tone={s.color} size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2 text-sm">
                        <span className="font-bold text-ink truncate">{s.name}</span>
                        <span className="font-extrabold text-ink">{fmt(m)}</span>
                      </div>
                      <ProgressBar value={(m ?? 0) * 10} tone={tone(m)} label={`Média de ${s.name}`} />
                      <span className="text-xs text-muted">{list.length} {list.length === 1 ? "nota" : "notas"}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card id="provas">
          <SectionTitle icon={CalendarClock} title="Provas" action="Adicionar" onAction={() => setExamOpen(true)} />
          {sortedExams.length === 0 ? (
            <EmptyState text="Nenhuma prova cadastrada." action="Adicionar prova" onAction={() => setExamOpen(true)} />
          ) : (
            <ul className="space-y-2">
              {sortedExams.map((e) => {
                const d = daysUntil(e.date);
                return (
                  <li key={e.id} className="flex items-center gap-3 rounded-2xl bg-surface2 p-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-ink truncate">{e.subject}</div>
                      <div className="text-xs text-muted">{formatShort(e.date)}{e.notes ? ` · ${e.notes}` : ""}</div>
                    </div>
                    <Chip tone={d < 0 ? "blue" : d <= 3 ? "pink" : d <= 7 ? "yellow" : "green"}>
                      {d < 0 ? "Realizada" : d === 0 ? "Hoje!" : d === 1 ? "Amanhã" : `em ${d} dias`}
                    </Chip>
                    <button onClick={() => { removeExam(e.id); toast("Prova removida"); }} aria-label={`Excluir prova de ${e.subject}`} className="text-muted hover:text-[var(--pink-fg)]">
                      <Trash2 size={18} aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <SectionTitle icon={GraduationCap} title="Todas as notas" />
        {grades.length === 0 ? (
          <EmptyState text="Você ainda não lançou nenhuma nota." action="Lançar nota" onAction={() => setGradeOpen(true)} />
        ) : (
          <ul className="divide-y divide-line">
            {[...grades].sort((a, b) => b.date.localeCompare(a.date)).map((g) => {
              const sub = subjects.find((s) => s.id === g.subjectId);
              const n = norm(g.value, g.max);
              return (
                <li key={g.id} className="flex items-center gap-3 py-2.5">
                  <Chip tone={tone(n)}>{String(g.value).replace(".", ",")}/{g.max}</Chip>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-ink truncate">{g.title}</div>
                    <div className="text-xs text-muted">{sub?.name ?? "Matéria removida"} · {formatShort(g.date)}</div>
                  </div>
                  <button onClick={() => { removeGrade(g.id); toast("Nota removida"); }} aria-label={`Excluir nota ${g.title}`} className="text-muted hover:text-[var(--pink-fg)]">
                    <Trash2 size={18} aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {gradeOpen && <GradeModal onClose={() => setGradeOpen(false)} onSave={(g) => { addGrade(g); toast("Nota lançada!"); setGradeOpen(false); }} />}
      {examOpen && <ExamModal onClose={() => setExamOpen(false)} onSave={(e) => { addExam(e); toast("Prova adicionada 📅"); setExamOpen(false); }} />}
    </div>
  );
}

function GradeModal({ onClose, onSave }: { onClose: () => void; onSave: (g: { subjectId: string; title: string; value: number; max: number; date: string }) => void }) {
  const subjects = useStore((s) => s.subjects);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [max, setMax] = useState("10");
  const [date, setDate] = useState(todayISO());

  const v = Number(value.replace(",", "."));
  const m = Number(max.replace(",", "."));
  const valid = subjectId && title.trim() && value !== "" && !Number.isNaN(v) && v >= 0 && m > 0 && v <= m;

  return (
    <Modal open onClose={onClose} title="Lançar nota">
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (valid) onSave({ subjectId, title: title.trim(), value: v, max: m, date }); }}>
        <Field label="Matéria">
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        <Field label="Avaliação"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Prova 1, Trabalho em grupo" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nota"><input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder="8,5" /></Field>
          <Field label="Valendo"><input inputMode="decimal" value={max} onChange={(e) => setMax(e.target.value)} /></Field>
        </div>
        <Field label="Data"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        {value !== "" && v > m && <p className="text-sm text-[var(--pink-fg)]">A nota não pode ser maior que o valor da prova.</p>}
        <Button type="submit" className="w-full" disabled={!valid}><Plus size={18} aria-hidden /> Salvar nota</Button>
      </form>
    </Modal>
  );
}

function ExamModal({ onClose, onSave }: { onClose: () => void; onSave: (e: { subject: string; date: string; notes?: string }) => void }) {
  const subjects = useStore((s) => s.subjects);
  const [subject, setSubject] = useState(subjects[0]?.name ?? "");
  const [date, setDate] = useState(todayISO());
  const [notes, setNotes] = useState("");

  return (
    <Modal open onClose={onClose} title="Adicionar prova">
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (subject.trim() && date) onSave({ subject: subject.trim(), date, notes: notes.trim() || undefined }); }}>
        <Field label="Matéria">
          <input list="exam-subjects" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex.: Matemática" />
          <datalist id="exam-subjects">{subjects.map((s) => <option key={s.id} value={s.name} />)}</datalist>
        </Field>
        <Field label="Data"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Observações (opcional)"><input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Capítulos 3 e 4" /></Field>
        <Button type="submit" className="w-full" disabled={!subject.trim() || !date}><Plus size={18} aria-hidden /> Salvar prova</Button>
      </form>
    </Modal>
  );
}
