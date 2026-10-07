"use client";

import { useState } from "react";
import { Button, Modal, cx } from "./ui";
import { useStore } from "@/lib/store";
import { toast, useUI } from "@/lib/ui-store";
import { todayISO } from "@/lib/dates";

export const MOODS = [
  { value: 1, emoji: "😞", label: "Muito mal" },
  { value: 2, emoji: "😕", label: "Mal" },
  { value: 3, emoji: "😐", label: "Normal" },
  { value: 4, emoji: "🙂", label: "Bem" },
  { value: 5, emoji: "😄", label: "Muito bem" },
];

const REPLIES: Record<number, string> = {
  1: "Sinto muito que o dia está pesado. Respire fundo, que tal um exercício de respiração? Eu estou aqui com você. 💙",
  2: "Dias assim acontecem. Faça uma pausa curta e seja gentil consigo mesma.",
  3: "Dia equilibrado! Um passo de cada vez já é progresso.",
  4: "Que bom! Aproveite essa energia para estudar com foco.",
  5: "Uau, que alegria! Vamos aproveitar esse pique! 🎉",
};

export function MoodModal() {
  const open = useUI((s) => s.moodOpen);
  const setOpen = useUI((s) => s.setMoodOpen);
  const moods = useStore((s) => s.moods);
  const setMood = useStore((s) => s.setMood);
  const today = moods.find((m) => m.date === todayISO());

  return open ? <Inner key={today?.value ?? 0} onClose={() => setOpen(false)} initial={today?.value} initialNote={today?.note ?? ""} setMood={setMood} /> : null;
}

function Inner({ onClose, initial, initialNote, setMood }: { onClose: () => void; initial?: number; initialNote: string; setMood: (v: number, n: string) => void }) {
  const [value, setValue] = useState<number | undefined>(initial);
  const [note, setNote] = useState(initialNote);
  const [saved, setSaved] = useState(false);

  const save = () => {
    if (!value) return;
    setMood(value, note.trim());
    setSaved(true);
    toast(initial ? "Humor atualizado 💙" : "Humor registrado! +5 XP 💙");
  };

  return (
    <Modal open onClose={onClose} title="Como você está hoje?">
      {saved && value ? (
        <div className="text-center py-2">
          <div className="text-6xl mb-3">{MOODS[value - 1].emoji}</div>
          <p className="text-ink font-semibold">{REPLIES[value]}</p>
          <Button className="mt-5" onClick={onClose}>Fechar</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Seu humor">
            {MOODS.map((m) => (
              <button
                key={m.value}
                role="radio"
                aria-checked={value === m.value}
                onClick={() => setValue(m.value)}
                className={cx("flex flex-col items-center gap-1 rounded-2xl p-2.5 border-2 transition", value === m.value ? "border-brand bg-brandsoft scale-105" : "border-line bg-surface2 hover:border-brand2")}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-[0.65rem] font-bold text-muted leading-3 text-center">{m.label}</span>
              </button>
            ))}
          </div>
          <div>
            <label className="field" htmlFor="mood-note">Quer escrever algo? (opcional)</label>
            <textarea id="mood-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="O que está passando pela sua cabeça?" />
          </div>
          <Button className="w-full" disabled={!value} onClick={save}>Salvar humor</Button>
        </div>
      )}
    </Modal>
  );
}
