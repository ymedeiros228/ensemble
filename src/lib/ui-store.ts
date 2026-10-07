"use client";

import { create } from "zustand";

export interface Toast {
  id: number;
  text: string;
}

interface UIState {
  toasts: Toast[];
  moodOpen: boolean;
  notifOpen: boolean;
  phrase: string;
  push: (text: string) => void;
  dismiss: (id: number) => void;
  setMoodOpen: (v: boolean) => void;
  setNotifOpen: (v: boolean) => void;
  setPhrase: (p: string) => void;
}

let counter = 0;

export const useUI = create<UIState>((set) => ({
  toasts: [],
  moodOpen: false,
  notifOpen: false,
  phrase: "Ei, você consegue! Já fez tanto até aqui... Agora é só continuar. Eu tô com você!",
  push: (text) => {
    const id = ++counter;
    set((s) => ({ toasts: [...s.toasts, { id, text }].slice(-3) }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 2800);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  setMoodOpen: (v) => set({ moodOpen: v }),
  setNotifOpen: (v) => set({ notifOpen: v }),
  setPhrase: (phrase) => set({ phrase }),
}));

export const toast = (text: string) => useUI.getState().push(text);

export const MASCOT_PHRASES = [
  "Ei, você consegue! Já fez tanto até aqui... Agora é só continuar. Eu tô com você!",
  "Um passo de cada vez. Hoje você já está mais perto do seu sonho!",
  "Bora focar 25 minutinhos? Eu cuido do tempo, você cuida do estudo!",
  "Respira fundo. Você é mais capaz do que imagina.",
  "Estudar um pouco todo dia vale mais do que muito num dia só!",
  "Orgulho de você por continuar tentando. Vamos juntas!",
  "Já bebeu água hoje? Cuidar de você também é estudar bem.",
  "Errar faz parte. Cada questão errada é uma aula grátis!",
];

export const TIPS = [
  "Estudar um pouco todos os dias é mais eficiente do que estudar muito em um só dia. Mantenha o ritmo!",
  "Use a técnica Pomodoro: 25 minutos de foco e 5 de pausa. Depois de 4 ciclos, descanse mais.",
  "Explique o conteúdo em voz alta como se estivesse ensinando alguém. Se travar, é ali que você precisa revisar.",
  "Revise o conteúdo em 24 horas, 7 dias e 30 dias. A repetição espaçada fixa o aprendizado.",
  "Resolva questões antigas do ENEM: elas mostram o estilo da prova e onde você mais erra.",
  "Dormir bem consolida a memória. Evite virar a noite estudando.",
  "Comece pela matéria mais difícil, quando sua energia está no máximo.",
  "Faça resumos com suas próprias palavras. Copiar o livro não ajuda a memorizar.",
];
