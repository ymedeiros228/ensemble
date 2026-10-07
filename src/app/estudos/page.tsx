"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen, CalendarPlus, ClipboardCheck, ClipboardList, FileText, FlaskConical, LayoutDashboard, ListChecks, Plus, Sigma, Timer, Trash2, Zap,
} from "lucide-react";
import { Button, Card, Chip, EmptyState, Field, IconBadge, Modal, PageHeader, ProgressBar, SectionTitle, SUBJECT_ICONS, TONES, Tabs, cx } from "@/components/ui";
import { Mascot } from "@/components/Mascot";
import { Pomodoro } from "@/components/study/Pomodoro";
import { TasksTab } from "@/components/study/TasksTab";
import { FormulasTab, SummariesTab } from "@/components/study/NotesTabs";
import { QuestionsTab, SimuladosTab } from "@/components/study/QuizTabs";
import { useStore } from "@/lib/store";
import { TIPS, toast } from "@/lib/ui-store";
import { DIAS_CURTOS, addDays, daysUntil, formatShort, todayISO } from "@/lib/dates";
import type { StudyGoal, Subject } from "@/lib/types";

type TabId = "visao" | "tarefas" | "resumos" | "formulas" | "questoes" | "simulados" | "pomodoro";

const TABS: { id: TabId; label: string; icon: typeof BookOpen }[] = [
  { id: "visao", label: "Visão geral", icon: LayoutDashboard },
  { id: "tarefas", label: "Tarefas", icon: ClipboardList },
  { id: "resumos", label: "Resumos", icon: FileText },
  { id: "formulas", label: "Fórmulas", icon: Sigma },
  { id: "questoes", label: "Questões", icon: ClipboardCheck },
  { id: "simulados", label: "Simulados", icon: ListChecks },
  { id: "pomodoro", label: "Pomodoro", icon: Timer },
];

export default function EstudosPage() {
  return (
    <Suspense fallback={null}>
      <Estudos />
    </Suspense>
  );
}

function Estudos() {
  const router = useRouter();
  const params = useSearchParams();
  const aba = (params.get("aba") as TabId) ?? "visao";
  const tab: TabId = TABS.some((t) => t.id === aba) ? aba : "visao";
  const go = (id: TabId) => router.replace(id === "visao" ? "/estudos" : `/estudos?aba=${id}`, { scroll: false });

  return (
    <div>
      <PageHeader icon={BookOpen} title="Estudos" subtitle="Seu progresso, passo a passo. Organize seus estudos, acompanhe seus avanços e mantenha o foco." mood="estudando" quote="Disciplina hoje, liberdade amanhã." />
      <Tabs tabs={TABS} value={tab} onChange={go} />
      {tab === "visao" && <Overview go={go} />}
      {tab === "tarefas" && <TasksTab />}
      {tab === "resumos" && <SummariesTab />}
      {tab === "formulas" && <FormulasTab />}
      {tab === "questoes" && <QuestionsTab />}
      {tab === "simulados" && <SimuladosTab />}
      {tab === "pomodoro" && <Pomodoro />}
    </div>
  );
}

/* ---------- Visão geral ---------- */

function Overview({ go }: { go: (t: TabId) => void }) {
  const subjects = useStore((s) => s.subjects);
  const goals = useStore((s) => s.studyGoals);
  const species = useStore((s) => s.profile.species);
  const [subjectModal, setSubjectModal] = useState<Subject | "new" | null>(null);
  const [goalModal, setGoalModal] = useState<StudyGoal | "new" | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [tip, setTip] = useState(() => Math.floor(Math.random() * TIPS.length));

  const overall = subjects.length ? Math.round(subjects.reduce((a, s) => a + s.progress, 0) / subjects.length) : 0;

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-4">
        <Card className="!bg-[linear-gradient(120deg,var(--brand-soft),var(--surface))] flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold text-ink flex items-center gap-2"><Zap className="text-brand" aria-hidden /> Continue!</h2>
            <p className="text-body mt-1 max-w-[16rem]">Grandes conquistas são feitas de pequenos avanços diários.</p>
            <div className="mt-4 flex items-center gap-3"><ProgressBar value={overall} height={10} label="Progresso geral de estudos" /><b className="text-ink text-sm">{overall}%</b></div>
          </div>
          <Mascot species={species} size={110} mood="comemorando" />
        </Card>

        <Card>
          <SectionTitle icon={Zap} title="Atalhos rápidos" />
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Adicionar matéria", icon: Plus, run: () => setSubjectModal("new") },
              { label: "Criar plano de estudos", icon: CalendarPlus, run: () => setPlanOpen(true) },
              { label: "Ver simulados", icon: ListChecks, run: () => go("simulados") },
              { label: "Ver resumos", icon: FileText, run: () => go("resumos") },
            ].map((a) => (
              <button key={a.label} onClick={a.run} className="flex items-center gap-3 rounded-2xl border border-line bg-solid p-3 text-left text-sm font-bold text-ink hover:bg-surface2 hover:border-brand2 transition">
                <span className="tone-blue grid h-9 w-9 shrink-0 place-items-center rounded-xl"><a.icon size={18} aria-hidden /></span>{a.label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle icon={ClipboardCheck} title="Minhas metas de estudo" href="/metas" action="Ver todas" />
        {goals.length === 0 ? <EmptyState text="Defina sua primeira meta de estudo." action="Nova meta" onAction={() => setGoalModal("new")} /> : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {goals.map((g) => {
              const n = g.targetDate ? daysUntil(g.targetDate) : null;
              return (
                <button key={g.id} onClick={() => setGoalModal(g)} className={cx("rounded-2xl p-4 text-left transition hover:-translate-y-0.5", `tone-${g.color}`)}>
                  <div className="font-extrabold text-ink">{g.title}</div>
                  {g.note && <div className="text-xs opacity-90">{g.note}</div>}
                  {n !== null && <div className="inline-block mt-2 rounded-full bg-solid/70 px-2.5 py-0.5 text-xs font-bold">{n < 0 ? "Prazo passou" : n === 0 ? "Hoje" : `Faltam ${n} dias`}</div>}
                  <div className="flex items-center gap-2 mt-3"><ProgressBar value={g.progress} tone={g.color} /><b className="text-xs">{g.progress}%</b></div>
                </button>
              );
            })}
            <button onClick={() => setGoalModal("new")} className="rounded-2xl border-2 border-dashed border-line p-4 text-muted font-bold hover:border-brand hover:text-brand grid place-items-center min-h-[7rem]"><Plus aria-hidden /> Nova meta</button>
          </div>
        )}
      </Card>

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-4">
        <Schedule />
        <Card>
          <SectionTitle icon={BookOpen} title="Matérias" action="Adicionar" onAction={() => setSubjectModal("new")} />
          {subjects.length === 0 ? <EmptyState text="Cadastre suas matérias para acompanhar o progresso." action="Adicionar matéria" onAction={() => setSubjectModal("new")} /> : (
            <ul>
              {subjects.map((s) => {
                const Icon = SUBJECT_ICONS[s.icon] ?? BookOpen;
                return (
                  <li key={s.id}>
                    <button onClick={() => setSubjectModal(s)} className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-surface2/60 rounded-xl px-1">
                      <IconBadge icon={Icon} tone={s.color} size={40} />
                      <span className="flex-1 min-w-0">
                        <span className="block font-bold text-ink">{s.name}</span>
                        <ProgressBar value={s.progress} tone={s.color} label={`Progresso em ${s.name}`} />
                      </span>
                      <span className="text-sm font-bold text-muted w-10 text-right">{s.progress}%</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card className="flex flex-wrap items-center gap-4 !bg-[linear-gradient(100deg,var(--brand-soft),var(--surface))]">
        <span className="tone-yellow grid h-11 w-11 place-items-center rounded-2xl"><FlaskConical aria-hidden /></span>
        <div className="flex-1 min-w-[220px]">
          <div className="font-extrabold text-ink">Dica do Ensemble</div>
          <p className="text-sm text-body">{TIPS[tip]}</p>
        </div>
        <Button variant="soft" onClick={() => setTip((t) => (t + 1) % TIPS.length)}>Ver mais dicas</Button>
      </Card>

      {subjectModal && <SubjectForm key={subjectModal === "new" ? "new" : subjectModal.id} subject={subjectModal === "new" ? null : subjectModal} onClose={() => setSubjectModal(null)} />}
      {goalModal && <GoalForm key={goalModal === "new" ? "new" : goalModal.id} goal={goalModal === "new" ? null : goalModal} onClose={() => setGoalModal(null)} />}
      <PlanModal open={planOpen} onClose={() => setPlanOpen(false)} />
    </div>
  );
}

/* ---------- Cronograma ---------- */

function Schedule() {
  const schedule = useStore((s) => s.schedule);
  const subjects = useStore((s) => s.subjects);
  const toggle = useStore((s) => s.toggleScheduleItem);
  const remove = useStore((s) => s.removeScheduleItem);
  const today = todayISO();
  const todayWd = new Date().getDay();
  const [wd, setWd] = useState(todayWd);
  const [open, setOpen] = useState(false);

  const date = addDays(today, wd - todayWd);
  const items = useMemo(() => schedule.filter((i) => i.weekday === wd).sort((a, b) => a.start.localeCompare(b.start)), [schedule, wd]);

  return (
    <Card>
      <SectionTitle icon={CalendarPlus} title="Meu cronograma de estudos" href="/agenda" action="Ver calendário" />
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2" role="tablist" aria-label="Dia da semana">
        {DIAS_CURTOS.map((d, i) => {
          const isToday = i === todayWd;
          return (
            <button key={d} role="tab" aria-selected={wd === i} onClick={() => setWd(i)} className={cx("shrink-0 rounded-full px-4 py-2 text-sm font-bold", wd === i ? "bg-brand text-white" : "bg-surface2 text-body")}>
              {isToday ? "Hoje" : d}
            </button>
          );
        })}
      </div>
      {items.length === 0 ? <EmptyState text="Nada planejado para este dia." action="Adicionar ao cronograma" onAction={() => setOpen(true)} /> : (
        <ul>
          {items.map((it) => {
            const subj = subjects.find((s) => s.id === it.subjectId);
            const done = it.doneOn.includes(date);
            return (
              <li key={it.id} className="flex items-center gap-3 py-2.5 border-b border-line last:border-0">
                <span className="text-xs sm:text-sm text-muted w-[6.2rem] shrink-0">{it.start} – {it.end}</span>
                {subj && <Chip tone={subj.color} className="shrink-0">{subj.name}</Chip>}
                <span className={cx("flex-1 min-w-0 text-sm truncate", done ? "line-through text-muted" : "text-ink font-semibold")}>{it.title}</span>
                <button onClick={() => { toggle(it.id, date); if (!done) toast("Bloco concluído! +8 XP"); }} role="checkbox" aria-checked={done} aria-label={`Concluir ${it.title}`} className={cx("grid h-6 w-6 place-items-center rounded-full border-2 shrink-0", done ? "bg-brand border-brand text-white" : "border-brand2/60 bg-solid")}>{done && "✓"}</button>
                <button onClick={() => remove(it.id)} aria-label={`Remover ${it.title}`} className="text-muted hover:text-danger"><Trash2 size={15} /></button>
              </li>
            );
          })}
        </ul>
      )}
      {items.length > 0 && <Button variant="soft" className="mt-3 w-full" onClick={() => setOpen(true)}><Plus size={16} aria-hidden /> Adicionar ao cronograma</Button>}
      <ScheduleForm open={open} onClose={() => setOpen(false)} weekday={wd} />
    </Card>
  );
}

function ScheduleForm({ open, onClose, weekday }: { open: boolean; onClose: () => void; weekday: number }) {
  const subjects = useStore((s) => s.subjects);
  const add = useStore((s) => s.addScheduleItem);
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("14:00");
  const [end, setEnd] = useState("15:00");
  return (
    <Modal open={open} onClose={onClose} title={`Novo bloco — ${DIAS_CURTOS[weekday]}`}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (end <= start) { toast("O horário final deve ser depois do inicial"); return; }
          add({ weekday, start, end, subjectId: subjectId || subjects[0]?.id || "", title: title.trim() });
          toast("Bloco adicionado");
          setTitle(""); onClose();
        }}
      >
        <Field label="Matéria"><select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}><option value="">{subjects[0]?.name ?? "—"}</option>{subjects.slice(1).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
        <Field label="O que vai estudar?"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Lista de exercícios" required /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Início"><input type="time" value={start} onChange={(e) => setStart(e.target.value)} required /></Field>
          <Field label="Fim"><input type="time" value={end} onChange={(e) => setEnd(e.target.value)} required /></Field>
        </div>
        <Button type="submit" className="w-full" disabled={subjects.length === 0}>Adicionar</Button>
        {subjects.length === 0 && <p className="text-xs text-danger">Cadastre uma matéria primeiro.</p>}
      </form>
    </Modal>
  );
}

/* ---------- Plano de estudos ---------- */

function PlanModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const subjects = useStore((s) => s.subjects);
  const add = useStore((s) => s.addScheduleItem);
  const [subjectId, setSubjectId] = useState("");
  const [days, setDays] = useState<number[]>([1, 3, 5]);
  const [start, setStart] = useState("19:00");
  const [end, setEnd] = useState("20:00");
  const [title, setTitle] = useState("Estudo focado");

  return (
    <Modal open={open} onClose={onClose} title="Criar plano de estudos">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const sid = subjectId || subjects[0]?.id;
          if (!sid) { toast("Cadastre uma matéria primeiro"); return; }
          if (days.length === 0) { toast("Escolha ao menos um dia"); return; }
          if (end <= start) { toast("O horário final deve ser depois do inicial"); return; }
          days.forEach((weekday) => add({ weekday, start, end, subjectId: sid, title: title.trim() || "Estudo" }));
          toast(`Plano criado: ${days.length} bloco(s) na semana 📅`);
          onClose();
        }}
      >
        <Field label="Matéria">
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        </Field>
        <Field label="Foco do estudo"><input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <fieldset>
          <legend className="field">Dias da semana</legend>
          <div className="flex flex-wrap gap-1.5">
            {DIAS_CURTOS.map((d, i) => (
              <button type="button" key={d} aria-pressed={days.includes(i)} onClick={() => setDays((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]))} className={cx("rounded-full px-3.5 py-2 text-sm font-bold", days.includes(i) ? "bg-brand text-white" : "bg-surface2 text-body")}>{d}</button>
            ))}
          </div>
        </fieldset>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Início"><input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
          <Field label="Fim"><input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
        </div>
        <Button type="submit" className="w-full">Criar plano</Button>
      </form>
    </Modal>
  );
}

/* ---------- Formulários de matéria e meta ---------- */

function SubjectForm({ subject, onClose }: { subject: Subject | null; onClose: () => void }) {
  const add = useStore((s) => s.addSubject);
  const update = useStore((s) => s.updateSubject);
  const remove = useStore((s) => s.removeSubject);
  const [name, setName] = useState(subject?.name ?? "");
  const [color, setColor] = useState(subject?.color ?? "blue");
  const [icon, setIcon] = useState(subject?.icon ?? "book");
  const [progress, setProgress] = useState(subject?.progress ?? 0);

  return (
    <Modal open onClose={onClose} title={subject ? subject.name : "Nova matéria"}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          if (subject) update(subject.id, { name: name.trim(), color, icon, progress });
          else add({ name: name.trim(), color, icon, progress });
          toast("Matéria salva");
          onClose();
        }}
      >
        <Field label="Nome"><input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex.: Sociologia" /></Field>
        <Field label="Ícone">
          <div className="flex flex-wrap gap-2">
            {Object.entries(SUBJECT_ICONS).map(([k, I]) => (
              <button key={k} type="button" aria-pressed={icon === k} aria-label={k} onClick={() => setIcon(k)} className={cx("grid h-10 w-10 place-items-center rounded-xl border-2", icon === k ? "border-brand bg-brandsoft text-brand" : "border-line text-muted")}><I size={18} /></button>
            ))}
          </div>
        </Field>
        <Field label="Cor">
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => <button key={t} type="button" aria-pressed={color === t} aria-label={t} onClick={() => setColor(t)} className={cx("h-8 w-8 rounded-full border-2", `fill-${t}`, color === t ? "border-ink scale-110" : "border-transparent")} />)}
          </div>
        </Field>
        <Field label={`Progresso: ${progress}%`}><input type="range" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} /></Field>
        <div className="flex gap-2">
          {subject && <Button variant="danger" onClick={() => { remove(subject.id); toast("Matéria removida"); onClose(); }}><Trash2 size={16} aria-hidden /> Excluir</Button>}
          <Button type="submit" className="flex-1">Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}

function GoalForm({ goal, onClose }: { goal: StudyGoal | null; onClose: () => void }) {
  const add = useStore((s) => s.addStudyGoal);
  const update = useStore((s) => s.updateStudyGoal);
  const remove = useStore((s) => s.removeStudyGoal);
  const [title, setTitle] = useState(goal?.title ?? "");
  const [color, setColor] = useState(goal?.color ?? "blue");
  const [targetDate, setTargetDate] = useState(goal?.targetDate ?? "");
  const [progress, setProgress] = useState(goal?.progress ?? 0);

  return (
    <Modal open onClose={onClose} title={goal ? "Editar meta" : "Nova meta de estudo"}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          const data = { title: title.trim(), color, targetDate: targetDate || undefined, progress };
          if (goal) { update(goal.id, data); if (progress === 100 && goal.progress < 100) toast("Meta concluída! +20 XP 🏆"); else toast("Meta atualizada"); }
          else { add(data); toast("Meta criada 🎯"); }
          onClose();
        }}
      >
        <Field label="Meta"><input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex.: Fechar o conteúdo de Química" /></Field>
        <Field label="Data-alvo (opcional)"><input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} /></Field>
        <Field label="Cor">
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => <button key={t} type="button" aria-pressed={color === t} aria-label={t} onClick={() => setColor(t)} className={cx("h-8 w-8 rounded-full border-2", `fill-${t}`, color === t ? "border-ink scale-110" : "border-transparent")} />)}
          </div>
        </Field>
        <Field label={`Progresso: ${progress}%`}><input type="range" min={0} max={100} step={5} value={progress} onChange={(e) => setProgress(Number(e.target.value))} /></Field>
        {goal?.targetDate && <p className="text-xs text-muted">Prazo atual: {formatShort(goal.targetDate)}</p>}
        <div className="flex gap-2">
          {goal && <Button variant="danger" onClick={() => { remove(goal.id); toast("Meta removida"); onClose(); }}><Trash2 size={16} aria-hidden /> Excluir</Button>}
          <Button type="submit" className="flex-1">Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}
