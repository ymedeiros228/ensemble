"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ListChecks, Play, Plus, Trash2, XCircle } from "lucide-react";
import { Button, Card, Chip, EmptyState, Field, Modal, ProgressBar, cx } from "@/components/ui";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/ui-store";
import { daysUntil, formatShort, todayISO } from "@/lib/dates";
import type { Question } from "@/lib/types";

const LETTERS = ["A", "B", "C", "D", "E"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function OptionList({ q, chosen, onPick }: { q: Question; chosen: number | null; onPick?: (i: number) => void }) {
  const revealed = chosen !== null;
  return (
    <ul className="space-y-2" role="radiogroup" aria-label="Alternativas">
      {q.options.map((o, i) => {
        const isRight = i === q.answer;
        const isChosen = chosen === i;
        return (
          <li key={i}>
            <button
              role="radio"
              aria-checked={isChosen}
              disabled={revealed && !!onPick}
              onClick={() => onPick?.(i)}
              className={cx(
                "w-full flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-semibold transition",
                !revealed && "border-line bg-solid text-ink hover:border-brand",
                revealed && isRight && "border-[var(--green-fg)] bg-[var(--green-bg)] text-[var(--green-fg)]",
                revealed && isChosen && !isRight && "border-[var(--pink-fg)] bg-[var(--pink-bg)] text-[var(--pink-fg)]",
                revealed && !isRight && !isChosen && "border-line bg-solid text-muted",
              )}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brandsoft text-brand text-sm font-extrabold">{LETTERS[i]}</span>
              <span className="flex-1">{o}</span>
              {revealed && isRight && <CheckCircle2 size={20} aria-label="Correta" />}
              {revealed && isChosen && !isRight && <XCircle size={20} aria-label="Errada" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function QuestionsTab() {
  const questions = useStore((s) => s.questions);
  const subjects = useStore((s) => s.subjects);
  const stats = useStore((s) => s.stats);
  const answer = useStore((s) => s.answerQuestion);
  const remove = useStore((s) => s.removeQuestion);
  const [filter, setFilter] = useState("");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const pool = useMemo(() => questions.filter((q) => !filter || q.subjectId === filter), [questions, filter]);
  const current = pool.find((q) => q.id === currentId) ?? pool[0];
  const accuracy = stats.questionsAnswered ? Math.round((stats.questionsCorrect / stats.questionsAnswered) * 100) : 0;

  const pick = (i: number) => {
    if (!current || chosen !== null) return;
    setChosen(i);
    const ok = answer(current.id, i);
    toast(ok ? "Acertou! +5 XP 🎉" : "Quase! Veja a correta e siga em frente 💪");
  };
  const next = () => {
    const others = pool.filter((q) => q.id !== current?.id);
    setCurrentId((others.length ? shuffle(others)[0] : current)?.id ?? null);
    setChosen(null);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <select className="!w-auto" value={filter} onChange={(e) => { setFilter(e.target.value); setCurrentId(null); setChosen(null); }} aria-label="Filtrar por matéria">
            <option value="">Todas as matérias</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <Button variant="soft" onClick={() => setOpen(true)} disabled={subjects.length === 0}><Plus size={16} aria-hidden /> Nova questão</Button>
        </div>
        {!current ? (
          <EmptyState text="Nenhuma questão para praticar. Crie a primeira!" />
        ) : (
          <div>
            <Chip tone={subjects.find((s) => s.id === current.subjectId)?.color ?? "blue"}>{subjects.find((s) => s.id === current.subjectId)?.name ?? "Matéria"}</Chip>
            <h2 className="text-xl font-extrabold text-ink my-3">{current.statement}</h2>
            <OptionList q={current} chosen={chosen} onPick={pick} />
            {chosen !== null && (
              <div className="mt-4 flex items-center justify-between">
                <p className={cx("font-bold", chosen === current.answer ? "text-[var(--green-fg)]" : "text-danger")}>
                  {chosen === current.answer ? "Resposta correta!" : `Resposta correta: ${LETTERS[current.answer]}`}
                </p>
                <Button onClick={next}>Próxima questão</Button>
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="space-y-4">
        <Card>
          <h2 className="text-ink font-extrabold text-lg mb-3">Seu desempenho</h2>
          <div className="grid grid-cols-2 gap-3 text-center mb-3">
            <div className="tone-blue rounded-2xl p-3"><div className="text-2xl font-extrabold">{stats.questionsAnswered}</div><div className="text-xs font-bold">respondidas</div></div>
            <div className="tone-green rounded-2xl p-3"><div className="text-2xl font-extrabold">{accuracy}%</div><div className="text-xs font-bold">de acerto</div></div>
          </div>
          <ProgressBar value={accuracy} tone="green" label="Taxa de acerto" />
        </Card>
        <Card>
          <h2 className="text-ink font-extrabold text-lg mb-2">Banco de questões ({pool.length})</h2>
          <ul className="max-h-64 overflow-y-auto">
            {pool.map((q) => (
              <li key={q.id} className="flex items-center gap-2 py-2 border-b border-line last:border-0 text-sm">
                <span className="flex-1 truncate text-body">{q.statement}</span>
                <button onClick={() => { remove(q.id); if (q.id === current?.id) { setChosen(null); setCurrentId(null); } }} aria-label="Excluir questão" className="text-muted hover:text-danger p-1"><Trash2 size={15} /></button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      {open && <QuestionForm onClose={() => setOpen(false)} />}
    </div>
  );
}

function QuestionForm({ onClose }: { onClose: () => void }) {
  const subjects = useStore((s) => s.subjects);
  const add = useStore((s) => s.addQuestion);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [statement, setStatement] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState(0);

  return (
    <Modal open onClose={onClose} title="Nova questão" wide>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (options.some((o) => !o.trim())) { toast("Preencha as 4 alternativas"); return; }
          add({ subjectId, statement: statement.trim(), options: options.map((o) => o.trim()), answer });
          toast("Questão adicionada");
          onClose();
        }}
      >
        <Field label="Matéria">
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        </Field>
        <Field label="Enunciado"><textarea rows={3} value={statement} onChange={(e) => setStatement(e.target.value)} required /></Field>
        <fieldset className="space-y-2">
          <legend className="field">Alternativas (marque a correta)</legend>
          {options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" name="correta" checked={answer === i} onChange={() => setAnswer(i)} aria-label={`Alternativa ${LETTERS[i]} é a correta`} className="!w-5 h-5" />
              <span className="font-extrabold text-brand w-5">{LETTERS[i]}</span>
              <input value={o} onChange={(e) => setOptions((p) => p.map((x, j) => (j === i ? e.target.value : x)))} required />
            </div>
          ))}
        </fieldset>
        <Button type="submit" className="w-full">Salvar questão</Button>
      </form>
    </Modal>
  );
}

/* ---------------- Simulados ---------------- */

export function SimuladosTab() {
  const simulados = useStore((s) => s.simulados);
  const questions = useStore((s) => s.questions);
  const subjects = useStore((s) => s.subjects);
  const add = useStore((s) => s.addSimulado);
  const remove = useStore((s) => s.removeSimulado);
  const [run, setRun] = useState<{ id: string; qs: Question[] } | null>(null);
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [count, setCount] = useState(5);

  const start = (id: string, existing: string[], total: number) => {
    const qs = existing.length ? existing.map((i) => questions.find((q) => q.id === i)).filter(Boolean) as Question[] : shuffle(questions).slice(0, Math.min(total, questions.length));
    if (qs.length === 0) { toast("Cadastre questões antes de fazer um simulado"); return; }
    setRun({ id, qs });
  };

  if (run) return <SimuladoRunner id={run.id} qs={run.qs} onExit={() => setRun(null)} />;

  const available = questions.filter((q) => !subject || q.subjectId === subject).length;

  return (
    <div>
      <div className="flex justify-end mb-4"><Button onClick={() => setOpen(true)}><Plus size={16} aria-hidden /> Novo simulado</Button></div>
      {simulados.length === 0 ? <Card><EmptyState text="Nenhum simulado ainda." /></Card> : (
        <div className="grid sm:grid-cols-2 gap-3">
          {simulados.map((s) => {
            const done = s.score !== undefined;
            const n = daysUntil(s.date);
            return (
              <Card key={s.id} as="article" className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-extrabold text-ink flex items-center gap-2"><ListChecks size={18} className="text-brand shrink-0" aria-hidden />{s.title}</h3>
                  {done ? <Chip tone="green">Concluído</Chip> : <Chip tone={n <= 3 ? "pink" : "blue"}>{n === 0 ? "Hoje" : n > 0 ? `em ${n} dias` : "Disponível"}</Chip>}
                </div>
                {done ? (
                  <div>
                    <div className="text-3xl font-extrabold text-ink">{s.score}<span className="text-muted text-lg">/{s.total}</span></div>
                    <ProgressBar value={(s.score! / Math.max(1, s.total)) * 100} tone="green" label="Nota do simulado" />
                  </div>
                ) : (
                  <p className="text-sm text-muted">{s.total} questões · {formatShort(s.date)}</p>
                )}
                <div className="flex gap-2 mt-auto">
                  <Button className="flex-1" variant={done ? "soft" : "primary"} onClick={() => start(s.id, done ? [] : s.questionIds, s.total)}>
                    <Play size={16} aria-hidden /> {done ? "Refazer" : "Fazer agora"}
                  </Button>
                  <Button variant="danger" aria-label={`Excluir ${s.title}`} onClick={() => remove(s.id)}><Trash2 size={16} aria-hidden /></Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Novo simulado">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const pool = questions.filter((q) => !subject || q.subjectId === subject);
            if (pool.length === 0) { toast("Não há questões dessa matéria"); return; }
            const picked = shuffle(pool).slice(0, Math.min(count, pool.length));
            const title = `Simulado ${subject ? subjects.find((s) => s.id === subject)?.name : "geral"} — ${formatShort(todayISO())}`;
            const id = add({ title, date: todayISO(), total: picked.length, questionIds: picked.map((q) => q.id) });
            setOpen(false);
            setRun({ id, qs: picked });
          }}
        >
          <Field label="Matéria">
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="">Todas</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label={`Quantidade de questões (máx. ${available})`}>
            <input type="number" min={1} max={Math.max(1, available)} value={count} onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))} />
          </Field>
          <Button type="submit" className="w-full" disabled={available === 0}>Começar</Button>
        </form>
      </Modal>
    </div>
  );
}

function SimuladoRunner({ id, qs, onExit }: { id: string; qs: Question[]; onExit: () => void }) {
  const finish = useStore((s) => s.finishSimulado);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => qs.map(() => null));
  const [done, setDone] = useState(false);

  const score = answers.filter((a, k) => a === qs[k].answer).length;

  if (done) {
    return (
      <Card className="text-center">
        <h2 className="text-2xl font-extrabold text-ink">Simulado concluído! 🎓</h2>
        <p className="text-6xl font-extrabold text-brand my-4">{score}<span className="text-muted text-3xl">/{qs.length}</span></p>
        <p className="text-body mb-4">{score / qs.length >= 0.7 ? "Excelente desempenho! Continue assim." : "Bom treino! Revise as questões erradas abaixo."}</p>
        <ul className="text-left space-y-4 max-w-2xl mx-auto">
          {qs.map((q, k) => (
            <li key={q.id} className="border-t border-line pt-3">
              <p className="font-bold text-ink mb-2">{k + 1}. {q.statement}</p>
              <OptionList q={q} chosen={answers[k] ?? -1} />
            </li>
          ))}
        </ul>
        <Button className="mt-6" onClick={onExit}>Voltar aos simulados</Button>
      </Card>
    );
  }

  const q = qs[i];
  return (
    <Card>
      <div className="flex items-center justify-between mb-2 text-sm text-muted font-bold">
        <span>Questão {i + 1} de {qs.length}</span>
        <button onClick={onExit} className="text-brand">Sair</button>
      </div>
      <ProgressBar value={((i + 1) / qs.length) * 100} label="Progresso do simulado" />
      <h2 className="text-xl font-extrabold text-ink my-4">{q.statement}</h2>
      <ul className="space-y-2" role="radiogroup" aria-label="Alternativas">
        {q.options.map((o, k) => (
          <li key={k}>
            <button
              role="radio"
              aria-checked={answers[i] === k}
              onClick={() => setAnswers((a) => a.map((x, j) => (j === i ? k : x)))}
              className={cx("w-full flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-semibold", answers[i] === k ? "border-brand bg-brandsoft text-ink" : "border-line bg-solid text-ink hover:border-brand2")}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brandsoft text-brand text-sm font-extrabold">{LETTERS[k]}</span>{o}
            </button>
          </li>
        ))}
      </ul>
      <div className="flex justify-between mt-5">
        <Button variant="ghost" disabled={i === 0} onClick={() => setI(i - 1)}>Anterior</Button>
        {i < qs.length - 1 ? (
          <Button disabled={answers[i] === null} onClick={() => setI(i + 1)}>Próxima</Button>
        ) : (
          <Button
            disabled={answers.some((a) => a === null)}
            onClick={() => { finish(id, qs.map((x) => x.id), score); setDone(true); toast("Simulado concluído! +30 XP 🎓"); }}
          >
            Finalizar
          </Button>
        )}
      </div>
    </Card>
  );
}
