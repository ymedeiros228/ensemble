import { addDays, todayISO } from "./dates";
import type { AppData } from "./types";

export const XP_PER_LEVEL = 500;

export const XP_REWARDS = {
  task: 10,
  scheduleItem: 8,
  question: 5,
  pomodoro: 15,
  mood: 5,
  simulado: 30,
  goal: 20,
};

export function levelInfo(xp: number) {
  return {
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    current: xp % XP_PER_LEVEL,
    max: XP_PER_LEVEL,
    pct: Math.round(((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100),
  };
}

/** Dias consecutivos com atividade, contando até hoje (ou até ontem, se hoje ainda não teve). */
export function computeStreak(activityDates: string[]): number {
  const set = new Set(activityDates);
  const today = todayISO();
  let cursor = set.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (set.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
}

export function computeAchievements(d: AppData): Achievement[] {
  const streak = computeStreak(d.stats.activityDates);
  const doneTasks = d.tasks.filter((t) => t.done).length;

  const list: [string, string, string, string, boolean][] = [
    ["first-task", "Primeiro passo", "Conclua sua primeira tarefa.", "🌱", doneTasks >= 1],
    ["ten-tasks", "Mão na massa", "Conclua 10 tarefas.", "✅", doneTasks >= 10],
    ["streak-7", "Semana de fogo", "Estude 7 dias seguidos.", "🔥", streak >= 7],
    ["streak-14", "Imparável", "Estude 14 dias seguidos.", "⚡", streak >= 14],
    ["pomodoro", "Foco total", "Complete 1 sessão Pomodoro.", "🍅", d.stats.pomodoros >= 1],
    ["pomodoro-10", "Mestre do foco", "Complete 10 sessões Pomodoro.", "🧠", d.stats.pomodoros >= 10],
    ["questions", "Praticante", "Responda 10 questões.", "📝", d.stats.questionsAnswered >= 10],
    ["simulado", "Pronta para a prova", "Finalize um simulado.", "🎓", d.simulados.some((s) => s.score !== undefined && s.questionIds.length > 0)],
    ["mood", "Cuidando de mim", "Registre seu humor.", "💙", d.moods.length >= 1],
    ["mood-7", "Autoconhecimento", "Registre o humor em 7 dias diferentes.", "🌈", d.moods.length >= 7],
    ["fin-goal", "Poupadora", "Crie uma meta financeira.", "🐷", d.finGoals.length >= 1],
    ["summary", "Organizada", "Crie um resumo.", "📚", d.summaries.length >= 1],
    ["community", "Conectada", "Entre em um grupo da comunidade.", "🤝", d.groups.some((g) => g.joined)],
    ["level-5", "Nível 5", "Alcance o nível 5.", "⭐", levelInfo(d.stats.xp).level >= 5],
  ];

  return list.map(([id, title, description, emoji, unlocked]) => ({ id, title, description, emoji, unlocked }));
}
