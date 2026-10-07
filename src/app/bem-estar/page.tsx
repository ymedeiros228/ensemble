"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Droplets, Heart, Moon, NotebookPen, Pause, Play, Sun, Trash2, Wind } from "lucide-react";
import { Button, Card, EmptyState, PageHeader, SectionTitle, cx } from "@/components/ui";
import { MOODS } from "@/components/MoodModal";
import { useStore } from "@/lib/store";
import { toast, useUI } from "@/lib/ui-store";
import { addDays, formatLong, formatShort, todayISO, weekdayName } from "@/lib/dates";

const CARE_TIPS = [
  { icon: Droplets, tone: "blue", title: "Beba água", text: "Mantenha uma garrafinha por perto enquanto estuda." },
  { icon: Moon, tone: "purple", title: "Durma bem", text: "7 a 9 horas de sono ajudam a fixar o que você aprendeu." },
  { icon: Sun, tone: "yellow", title: "Pegue sol", text: "10 minutos ao ar livre melhoram o humor e a energia." },
  { icon: Heart, tone: "pink", title: "Seja gentil", text: "Fale consigo como falaria com uma amiga." },
];

export default function BemEstarPage() {
  const moods = useStore((s) => s.moods);
  const setMoodOpen = useUI((s) => s.setMoodOpen);
  const today = todayISO();
  const todayMood = moods.find((m) => m.date === today);

  const days = useMemo(
    () => Array.from({ length: 14 }, (_, i) => {
      const date = addDays(today, i - 13);
      return { date, entry: moods.find((m) => m.date === date) };
    }),
    [moods, today],
  );

  const recent = days.filter((d) => d.entry).map((d) => d.entry!.value);
  const average = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : null;

  return (
    <div>
      <PageHeader icon={Heart} title="Bem-estar" subtitle="Cuidar de você também é estudar bem." mood="calmo" quote="Respira... você está indo bem." />

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <SectionTitle icon={Heart} title="Seu humor" />
          {todayMood ? (
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{MOODS[todayMood.value - 1].emoji}</span>
              <div>
                <div className="font-extrabold text-ink">Hoje: {MOODS[todayMood.value - 1].label}</div>
                {todayMood.note && <p className="text-sm text-muted">“{todayMood.note}”</p>}
              </div>
            </div>
          ) : (
            <p className="text-muted text-sm mb-4">Você ainda não registrou como está hoje.</p>
          )}
          <Button onClick={() => setMoodOpen(true)}>{todayMood ? "Alterar humor de hoje" : "Registrar humor (+5 XP)"}</Button>

          <h3 className="font-extrabold text-ink mt-6 mb-2">Últimos 14 dias</h3>
          <div className="grid grid-cols-14 gap-1" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
            {days.map(({ date, entry }) => (
              <div key={date} className="flex flex-col items-center gap-1" title={`${formatShort(date)}${entry ? ` · ${MOODS[entry.value - 1].label}` : " · sem registro"}`}>
                <div
                  className={cx("w-full rounded-lg", entry ? "fill-blue" : "bg-surface2")}
                  style={{ height: entry ? 10 + entry.value * 12 : 8, opacity: entry ? 0.35 + entry.value * 0.13 : 1 }}
                  aria-label={entry ? `${formatShort(date)}: ${MOODS[entry.value - 1].label}` : `${formatShort(date)}: sem registro`}
                />
                <span className="text-[0.6rem] text-muted">{weekdayName(date).slice(0, 1).toUpperCase()}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted mt-3">
            {average === null ? "Registre seu humor para ver o histórico." : `Humor médio: ${average.toFixed(1).replace(".", ",")} de 5 · ${recent.length} ${recent.length === 1 ? "registro" : "registros"}`}
          </p>
        </Card>

        <Breathing />
      </div>

      <Journal />

      <Card className="mt-4">
        <SectionTitle icon={Heart} title="Dicas de autocuidado" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CARE_TIPS.map((t) => (
            <div key={t.title} className={cx("rounded-2xl p-4", `tone-${t.tone}`)}>
              <t.icon size={24} aria-hidden />
              <div className="font-extrabold mt-2">{t.title}</div>
              <p className="text-sm opacity-90">{t.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/** Respiração guiada 4-4-6: inspire 4s, segure 4s, expire 6s. */
const PHASES = [
  { label: "Inspire", sec: 4, scale: 1.25 },
  { label: "Segure", sec: 4, scale: 1.25 },
  { label: "Expire", sec: 6, scale: 0.8 },
] as const;

function Breathing() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState<number>(PHASES[0].sec);
  const [cycles, setCycles] = useState(0);
  const state = useRef({ phase: 0, count: 4 });

  useEffect(() => {
    if (!running) return;
    state.current = { phase: 0, count: PHASES[0].sec };
    const id = setInterval(() => {
      const s = state.current;
      s.count -= 1;
      if (s.count <= 0) {
        s.phase = (s.phase + 1) % PHASES.length;
        s.count = PHASES[s.phase].sec;
        if (s.phase === 0) setCycles((c) => c + 1);
      }
      setPhase(s.phase);
      setCount(s.count);
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const toggle = () => {
    if (running) {
      setRunning(false);
      setPhase(0);
      setCount(PHASES[0].sec);
    } else {
      setCycles(0);
      setRunning(true);
    }
  };

  const current = PHASES[phase];

  return (
    <Card className="flex flex-col items-center text-center">
      <div className="self-start w-full"><SectionTitle icon={Wind} title="Respiração guiada" /></div>
      <div className="relative grid place-items-center h-56 w-56 my-2">
        <motion.div
          className="absolute inset-0 rounded-full bg-brandsoft"
          animate={{ scale: running ? current.scale : 1 }}
          transition={{ duration: running ? current.sec : 0.4, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-6 rounded-full bg-brand/25"
          animate={{ scale: running ? current.scale : 1 }}
          transition={{ duration: running ? current.sec : 0.4, ease: "easeInOut" }}
        />
        <div className="relative" aria-live="polite">
          <div className="text-2xl font-extrabold text-ink">{running ? current.label : "Pronta?"}</div>
          <div className="text-4xl font-extrabold text-brand tabular-nums">{running ? count : "4-4-6"}</div>
        </div>
      </div>
      <p className="text-sm text-muted mb-3">Inspire por 4s, segure por 4s e expire por 6s. {running && cycles > 0 ? `Ciclos: ${cycles}` : ""}</p>
      <Button onClick={toggle}>{running ? <><Pause size={18} aria-hidden /> Parar</> : <><Play size={18} aria-hidden /> Começar</>}</Button>
    </Card>
  );
}

function Journal() {
  const journal = useStore((s) => s.journal);
  const addJournal = useStore((s) => s.addJournal);
  const removeJournal = useStore((s) => s.removeJournal);
  const [text, setText] = useState("");

  const save = () => {
    if (!text.trim()) return;
    addJournal(text.trim());
    setText("");
    toast("Anotação salva no diário 📓");
  };

  return (
    <Card className="mt-4">
      <SectionTitle icon={NotebookPen} title="Diário" />
      <label className="field" htmlFor="journal-text">Como foi seu dia? O que você sentiu?</label>
      <textarea id="journal-text" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva livremente. Só você vê isso." />
      <Button className="mt-3" onClick={save} disabled={!text.trim()}>Salvar no diário</Button>

      <div className="mt-5">
        {journal.length === 0 ? (
          <EmptyState text="Seu diário está vazio. Escrever ajuda a organizar os pensamentos." />
        ) : (
          <ul className="space-y-2">
            {[...journal].sort((a, b) => b.date.localeCompare(a.date)).map((j) => (
              <li key={j.id} className="rounded-2xl bg-surface2 p-3 flex gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-muted mb-1">{formatLong(j.date)}</div>
                  <p className="text-body whitespace-pre-wrap break-words">{j.text}</p>
                </div>
                <button onClick={() => { removeJournal(j.id); toast("Anotação removida"); }} aria-label="Excluir anotação" className="text-muted hover:text-[var(--pink-fg)] self-start">
                  <Trash2 size={18} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
