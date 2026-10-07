"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { Button, Card, Field, cx } from "@/components/ui";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/ui-store";

type Mode = "foco" | "pausa" | "pausa-longa";
const MODES: Record<Mode, { label: string; min: number }> = {
  foco: { label: "Foco", min: 25 },
  pausa: { label: "Pausa curta", min: 5 },
  "pausa-longa": { label: "Pausa longa", min: 15 },
};

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function Pomodoro() {
  const subjects = useStore((s) => s.subjects);
  const stats = useStore((s) => s.stats);
  const complete = useStore((s) => s.completePomodoro);
  const [mode, setMode] = useState<Mode>("foco");
  const [custom, setCustom] = useState<Record<Mode, number>>({ foco: 25, pausa: 5, "pausa-longa": 15 });
  const [left, setLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [subject, setSubject] = useState("");
  const endAt = useRef<number>(0);

  const total = custom[mode] * 60;

  // Contagem baseada em relógio (não perde tempo se a aba ficar em segundo plano)
  useEffect(() => {
    if (!running) return;
    endAt.current = Date.now() + left * 1000;
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.round((endAt.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        clearInterval(id);
        finish();
      }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode]);

  useEffect(() => {
    document.title = running ? `${fmt(left)} · ${MODES[mode].label} — Ensemble` : "Ensemble — estudos, agenda, finanças e bem-estar";
    return () => { document.title = "Ensemble — estudos, agenda, finanças e bem-estar"; };
  }, [running, left, mode]);

  function switchMode(m: Mode, autoStart = false) {
    setMode(m);
    setLeft(custom[m] * 60);
    setRunning(autoStart);
  }

  function finish(skipped = false) {
    setRunning(false);
    if (!skipped) try { new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=").play().catch(() => {}); } catch {}
    if (mode === "foco") {
      const next = cycle + 1;
      if (!skipped) {
        complete(custom.foco);
        toast("Sessão concluída! +15 XP 🍅");
      }
      setCycle(next);
      switchMode(next % 4 === 0 ? "pausa-longa" : "pausa");
    } else {
      toast("Pausa terminada. Bora focar!");
      switchMode("foco");
    }
  }

  const pct = ((total - left) / total) * 100;
  const R = 110;
  const C = 2 * Math.PI * R;

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4">
      <Card className="flex flex-col items-center py-8">
        <div role="tablist" className="flex gap-1.5 bg-surface2 rounded-full p-1 mb-6">
          {(Object.keys(MODES) as Mode[]).map((m) => (
            <button key={m} role="tab" aria-selected={mode === m} onClick={() => switchMode(m)} className={cx("rounded-full px-4 py-2 text-sm font-bold transition", mode === m ? "bg-brand text-white" : "text-body")}>
              {MODES[m].label}
            </button>
          ))}
        </div>

        <div className="relative" role="timer" aria-live="off" aria-label={`${fmt(left)} restantes`}>
          <svg width="260" height="260" viewBox="0 0 260 260" className="-rotate-90">
            <circle cx="130" cy="130" r={R} fill="none" stroke="var(--brand-soft)" strokeWidth="14" />
            <circle cx="130" cy="130" r={R} fill="none" stroke={mode === "foco" ? "var(--brand)" : "var(--green-fg)"} strokeWidth="14" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C - (C * pct) / 100} style={{ transition: "stroke-dashoffset 0.3s linear" }} />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="text-6xl font-extrabold text-ink tabular-nums">{fmt(left)}</div>
              <div className="text-muted font-semibold">{MODES[mode].label}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={() => setRunning((r) => !r)} className="!px-8 !py-3.5 text-base">
            {running ? <><Pause size={20} aria-hidden /> Pausar</> : <><Play size={20} aria-hidden /> {left === total ? "Iniciar" : "Continuar"}</>}
          </Button>
          <Button variant="soft" onClick={() => { setRunning(false); setLeft(total); }} aria-label="Reiniciar"><RotateCcw size={18} aria-hidden /></Button>
          <Button variant="soft" onClick={() => finish(true)} aria-label="Pular etapa"><SkipForward size={18} aria-hidden /></Button>
        </div>
        <p className="text-sm text-muted mt-4">Ciclo {cycle % 4 + (mode === "foco" ? 1 : 0)} de 4 · a cada 4 focos, uma pausa longa</p>
      </Card>

      <div className="space-y-4">
        <Card>
          <h2 className="text-ink font-extrabold text-lg mb-3">Configurar</h2>
          <div className="space-y-3">
            <Field label="Estudando agora">
              <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="">Sem matéria específica</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            {(Object.keys(MODES) as Mode[]).map((m) => (
              <Field key={m} label={`${MODES[m].label} (min)`}>
                <input
                  type="number" min={1} max={120} value={custom[m]}
                  onChange={(e) => {
                    const v = Math.max(1, Math.min(120, Number(e.target.value) || 1));
                    setCustom((c) => ({ ...c, [m]: v }));
                    if (m === mode && !running) setLeft(v * 60);
                  }}
                />
              </Field>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-ink font-extrabold text-lg mb-3">Seu foco</h2>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="tone-blue rounded-2xl p-3"><div className="text-2xl font-extrabold">{stats.pomodoros}</div><div className="text-xs font-bold">sessões</div></div>
            <div className="tone-green rounded-2xl p-3"><div className="text-2xl font-extrabold">{Math.floor(stats.focusMinutes / 60)}h{String(stats.focusMinutes % 60).padStart(2, "0")}</div><div className="text-xs font-bold">de foco</div></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
