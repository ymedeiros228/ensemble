"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { todayISO, uid } from "./dates";
import { XP_REWARDS } from "./gamification";
import { buildEmpty, buildSeed } from "./seed";
import type {
  AppData, CalEvent, Category, CommEvent, Exam, Experience, FinGoal, Formula, Grade, Group, JournalEntry,
  Profile, Question, ScheduleItem, Settings, Simulado, StudyGoal, Subject, Summary, Task, Transaction,
} from "./types";

interface Actions {
  // tarefas
  addTask: (t: { title: string; category: Category; due: string }) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  // agenda
  addEvent: (e: Omit<CalEvent, "id">) => void;
  updateEvent: (id: string, e: Partial<Omit<CalEvent, "id">>) => void;
  removeEvent: (id: string) => void;
  // estudos
  addSubject: (s: Omit<Subject, "id">) => void;
  updateSubject: (id: string, s: Partial<Omit<Subject, "id">>) => void;
  removeSubject: (id: string) => void;
  addStudyGoal: (g: Omit<StudyGoal, "id">) => void;
  updateStudyGoal: (id: string, g: Partial<Omit<StudyGoal, "id">>) => void;
  removeStudyGoal: (id: string) => void;
  addExam: (e: Omit<Exam, "id">) => void;
  removeExam: (id: string) => void;
  saveSummary: (s: Omit<Summary, "id" | "updatedAt"> & { id?: string }) => void;
  removeSummary: (id: string) => void;
  addFormula: (f: Omit<Formula, "id">) => void;
  removeFormula: (id: string) => void;
  addQuestion: (q: Omit<Question, "id">) => void;
  removeQuestion: (id: string) => void;
  answerQuestion: (id: string, choice: number) => boolean;
  addSimulado: (s: Omit<Simulado, "id">) => string;
  finishSimulado: (id: string, questionIds: string[], score: number) => void;
  removeSimulado: (id: string) => void;
  addScheduleItem: (s: Omit<ScheduleItem, "id" | "doneOn">) => void;
  toggleScheduleItem: (id: string, date: string) => void;
  removeScheduleItem: (id: string) => void;
  completePomodoro: (minutes: number) => void;
  // financeiro
  addTransaction: (t: Omit<Transaction, "id">) => void;
  removeTransaction: (id: string) => void;
  addFinGoal: (g: Omit<FinGoal, "id">) => void;
  depositFinGoal: (id: string, value: number) => void;
  removeFinGoal: (id: string) => void;
  syncBank: () => void;
  setBank: (b: Partial<Settings["bank"]>) => void;
  // bem-estar
  setMood: (value: number, note: string) => void;
  addJournal: (text: string) => void;
  removeJournal: (id: string) => void;
  // notas
  addGrade: (g: Omit<Grade, "id">) => void;
  removeGrade: (id: string) => void;
  // comunidade
  toggleGroup: (id: string) => void;
  addGroup: (g: { name: string; description: string; emoji: string }) => void;
  postInGroup: (id: string, text: string) => void;
  toggleCommEvent: (id: string) => void;
  // perfil
  updateProfile: (p: Partial<Profile>) => void;
  setSkillLevel: (id: string, level: number) => void;
  addSkill: (group: AppData["skills"][number]["group"], name: string) => void;
  removeSkill: (id: string) => void;
  addExperience: (e: Omit<Experience, "id">) => void;
  removeExperience: (id: string) => void;
  addPersonalGoal: (title: string) => void;
  togglePersonalGoal: (id: string) => void;
  removePersonalGoal: (id: string) => void;
  toggleConnection: (id: string) => void;
  // configurações
  updateSettings: (s: Partial<Settings>) => void;
  markNotifsSeen: (ids: string[]) => void;
  resetToDemo: () => void;
  clearAll: () => void;
  importData: (d: AppData) => void;
}

export type Store = AppData & Actions;

/** Registra um dia de atividade de estudo e soma XP. */
function reward(s: AppData, xp: number, studied = true): AppData["stats"] {
  const today = todayISO();
  const dates = studied && !s.stats.activityDates.includes(today) ? [...s.stats.activityDates, today] : s.stats.activityDates;
  return { ...s.stats, xp: Math.max(0, s.stats.xp + xp), activityDates: dates };
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...buildSeed(),

      addTask: (t) => set((s) => ({ tasks: [{ id: uid(), done: false, ...t }, ...s.tasks] })),
      toggleTask: (id) =>
        set((s) => {
          const task = s.tasks.find((t) => t.id === id);
          if (!task) return {};
          const done = !task.done;
          return {
            tasks: s.tasks.map((t) => (t.id === id ? { ...t, done } : t)),
            stats: reward(s, done ? XP_REWARDS.task : -XP_REWARDS.task, done),
          };
        }),
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      addEvent: (e) => set((s) => ({ events: [...s.events, { id: uid(), ...e }] })),
      updateEvent: (id, e) => set((s) => ({ events: s.events.map((x) => (x.id === id ? { ...x, ...e } : x)) })),
      removeEvent: (id) => set((s) => ({ events: s.events.filter((x) => x.id !== id) })),

      addSubject: (sub) => set((s) => ({ subjects: [...s.subjects, { id: uid(), ...sub }] })),
      updateSubject: (id, sub) => set((s) => ({ subjects: s.subjects.map((x) => (x.id === id ? { ...x, ...sub } : x)) })),
      removeSubject: (id) => set((s) => ({ subjects: s.subjects.filter((x) => x.id !== id) })),
      addStudyGoal: (g) => set((s) => ({ studyGoals: [...s.studyGoals, { id: uid(), ...g }] })),
      updateStudyGoal: (id, g) =>
        set((s) => {
          const before = s.studyGoals.find((x) => x.id === id);
          const completes = before && before.progress < 100 && g.progress === 100;
          return {
            studyGoals: s.studyGoals.map((x) => (x.id === id ? { ...x, ...g } : x)),
            stats: completes ? reward(s, XP_REWARDS.goal, false) : s.stats,
          };
        }),
      removeStudyGoal: (id) => set((s) => ({ studyGoals: s.studyGoals.filter((x) => x.id !== id) })),
      addExam: (e) => set((s) => ({ exams: [...s.exams, { id: uid(), ...e }].sort((a, b) => a.date.localeCompare(b.date)) })),
      removeExam: (id) => set((s) => ({ exams: s.exams.filter((x) => x.id !== id) })),

      saveSummary: (sm) =>
        set((s) => {
          const updatedAt = todayISO();
          if (sm.id) return { summaries: s.summaries.map((x) => (x.id === sm.id ? { ...x, ...sm, updatedAt } : x)) };
          return { summaries: [{ id: uid(), updatedAt, subjectId: sm.subjectId, title: sm.title, body: sm.body }, ...s.summaries] };
        }),
      removeSummary: (id) => set((s) => ({ summaries: s.summaries.filter((x) => x.id !== id) })),
      addFormula: (f) => set((s) => ({ formulas: [{ id: uid(), ...f }, ...s.formulas] })),
      removeFormula: (id) => set((s) => ({ formulas: s.formulas.filter((x) => x.id !== id) })),

      addQuestion: (q) => set((s) => ({ questions: [{ id: uid(), ...q }, ...s.questions] })),
      removeQuestion: (id) => set((s) => ({ questions: s.questions.filter((x) => x.id !== id) })),
      answerQuestion: (id, choice) => {
        const q = get().questions.find((x) => x.id === id);
        if (!q) return false;
        const correct = q.answer === choice;
        set((s) => ({
          questions: s.questions.map((x) => (x.id === id ? { ...x, lastChoice: choice } : x)),
          stats: {
            ...reward(s, correct ? XP_REWARDS.question : 1),
            questionsAnswered: s.stats.questionsAnswered + 1,
            questionsCorrect: s.stats.questionsCorrect + (correct ? 1 : 0),
          },
        }));
        return correct;
      },
      addSimulado: (sim) => {
        const id = uid();
        set((s) => ({ simulados: [{ id, ...sim }, ...s.simulados] }));
        return id;
      },
      finishSimulado: (id, questionIds, score) =>
        set((s) => ({
          simulados: s.simulados.map((x) => (x.id === id ? { ...x, questionIds, total: questionIds.length, score } : x)),
          stats: reward(s, XP_REWARDS.simulado),
        })),
      removeSimulado: (id) => set((s) => ({ simulados: s.simulados.filter((x) => x.id !== id) })),

      addScheduleItem: (it) => set((s) => ({ schedule: [...s.schedule, { id: uid(), doneOn: [], ...it }] })),
      toggleScheduleItem: (id, date) =>
        set((s) => {
          const item = s.schedule.find((x) => x.id === id);
          if (!item) return {};
          const was = item.doneOn.includes(date);
          return {
            schedule: s.schedule.map((x) =>
              x.id === id ? { ...x, doneOn: was ? x.doneOn.filter((d) => d !== date) : [...x.doneOn, date] } : x,
            ),
            stats: reward(s, was ? -XP_REWARDS.scheduleItem : XP_REWARDS.scheduleItem, !was),
          };
        }),
      removeScheduleItem: (id) => set((s) => ({ schedule: s.schedule.filter((x) => x.id !== id) })),
      completePomodoro: (minutes) =>
        set((s) => ({
          stats: { ...reward(s, XP_REWARDS.pomodoro), pomodoros: s.stats.pomodoros + 1, focusMinutes: s.stats.focusMinutes + minutes },
        })),

      addTransaction: (t) => set((s) => ({ transactions: [{ id: uid(), ...t }, ...s.transactions] })),
      removeTransaction: (id) => set((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) })),
      addFinGoal: (g) => set((s) => ({ finGoals: [...s.finGoals, { id: uid(), ...g }] })),
      depositFinGoal: (id, value) =>
        set((s) => ({
          finGoals: s.finGoals.map((g) => (g.id === id ? { ...g, saved: Math.max(0, Math.min(g.target, g.saved + value)) } : g)),
        })),
      removeFinGoal: (id) => set((s) => ({ finGoals: s.finGoals.filter((x) => x.id !== id) })),
      syncBank: () => set((s) => ({ settings: { ...s.settings, bank: { ...s.settings.bank, lastSync: new Date().toISOString() } } })),
      setBank: (b) => set((s) => ({ settings: { ...s.settings, bank: { ...s.settings.bank, ...b } } })),

      setMood: (value, note) =>
        set((s) => {
          const date = todayISO();
          const exists = s.moods.some((m) => m.date === date);
          const moods = exists ? s.moods.map((m) => (m.date === date ? { date, value, note } : m)) : [...s.moods, { date, value, note }];
          return { moods, stats: exists ? s.stats : reward(s, XP_REWARDS.mood, false) };
        }),
      addJournal: (text) => set((s) => ({ journal: [{ id: uid(), date: todayISO(), text } as JournalEntry, ...s.journal] })),
      removeJournal: (id) => set((s) => ({ journal: s.journal.filter((x) => x.id !== id) })),

      addGrade: (g) => set((s) => ({ grades: [{ id: uid(), ...g }, ...s.grades] })),
      removeGrade: (id) => set((s) => ({ grades: s.grades.filter((x) => x.id !== id) })),

      toggleGroup: (id) =>
        set((s) => ({
          groups: s.groups.map((g) => (g.id === id ? { ...g, joined: !g.joined, members: g.members + (g.joined ? -1 : 1) } : g)),
        })),
      addGroup: (g) =>
        set((s) => ({
          groups: [{ id: uid(), name: g.name, description: g.description, emoji: g.emoji, members: 1, joined: true, posts: [] } as Group, ...s.groups],
        })),
      postInGroup: (id, text) =>
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === id ? { ...g, posts: [{ id: uid(), author: s.profile.name, text, date: todayISO() }, ...g.posts] } : g,
          ),
        })),
      toggleCommEvent: (id) =>
        set((s) => ({ commEvents: s.commEvents.map((e) => (e.id === id ? { ...e, joined: !e.joined } : e)) as CommEvent[] })),

      updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      setSkillLevel: (id, level) =>
        set((s) => ({ skills: s.skills.map((k) => (k.id === id ? { ...k, level: Math.max(1, Math.min(5, level)) } : k)) })),
      addSkill: (group, name) => set((s) => ({ skills: [...s.skills, { id: uid(), group, name, level: 1 }] })),
      removeSkill: (id) => set((s) => ({ skills: s.skills.filter((k) => k.id !== id) })),
      addExperience: (e) => set((s) => ({ experience: [...s.experience, { id: uid(), ...e }] })),
      removeExperience: (id) => set((s) => ({ experience: s.experience.filter((x) => x.id !== id) })),
      addPersonalGoal: (title) => set((s) => ({ personalGoals: [...s.personalGoals, { id: uid(), title, done: false }] })),
      togglePersonalGoal: (id) =>
        set((s) => {
          const g = s.personalGoals.find((x) => x.id === id);
          if (!g) return {};
          return {
            personalGoals: s.personalGoals.map((x) => (x.id === id ? { ...x, done: !x.done } : x)),
            stats: !g.done ? reward(s, XP_REWARDS.goal, false) : s.stats,
          };
        }),
      removePersonalGoal: (id) => set((s) => ({ personalGoals: s.personalGoals.filter((x) => x.id !== id) })),

      toggleConnection: (id) =>
        set((s) => ({ connections: s.connections.includes(id) ? s.connections.filter((c) => c !== id) : [...s.connections, id] })),

      updateSettings: (st) => set((s) => ({ settings: { ...s.settings, ...st } })),
      markNotifsSeen: (ids) => set((s) => ({ settings: { ...s.settings, seenNotifs: Array.from(new Set([...s.settings.seenNotifs, ...ids])).slice(-200) } })),
      resetToDemo: () => set({ ...buildSeed() }),
      clearAll: () => set((s) => ({ ...buildEmpty(), profile: s.profile, settings: { ...buildEmpty().settings, theme: s.settings.theme } })),
      importData: (d) => set({ ...d }),
    }),
    {
      name: "ensemble-data-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => {
        // Persiste somente dados (sem as funções de ação).
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(s)) if (typeof v !== "function") out[k] = v;
        return out as unknown as Store;
      },
    },
  ),
);

export type { Task };
