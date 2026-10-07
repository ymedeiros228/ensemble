export type Category = "Estudos" | "Trabalho" | "Prova da escola" | "Simulado" | "Escola" | "Pessoal";

export const CATEGORIES: Category[] = ["Estudos", "Trabalho", "Prova da escola", "Simulado", "Escola", "Pessoal"];

export interface Task {
  id: string;
  title: string;
  category: Category;
  due: string; // yyyy-mm-dd
  done: boolean;
}

export interface CalEvent {
  id: string;
  title: string;
  date: string;
  start: string; // HH:mm
  end: string;
  category: Category;
  notes?: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string; // chave de cor: blue, purple, pink, green, yellow, teal, orange
  icon: string; // chave do ícone
  progress: number; // 0-100
}

export interface StudyGoal {
  id: string;
  title: string;
  color: string;
  targetDate?: string;
  progress: number;
  note?: string;
}

export interface Exam {
  id: string;
  subject: string;
  date: string;
  notes?: string;
}

export interface Summary {
  id: string;
  subjectId: string;
  title: string;
  body: string;
  updatedAt: string;
}

export interface Formula {
  id: string;
  subjectId: string;
  title: string;
  expr: string;
}

export interface Question {
  id: string;
  subjectId: string;
  statement: string;
  options: string[];
  answer: number;
  lastChoice?: number;
}

export interface Simulado {
  id: string;
  title: string;
  date: string;
  total: number;
  score?: number;
  questionIds: string[];
}

export interface ScheduleItem {
  id: string;
  weekday: number; // 0 = domingo
  start: string;
  end: string;
  subjectId: string;
  title: string;
  doneOn: string[]; // datas concluídas
}

export interface Transaction {
  id: string;
  title: string;
  note: string;
  amount: number; // positivo = entrada, negativo = saída
  category: string;
  date: string;
}

export interface FinGoal {
  id: string;
  title: string;
  saved: number;
  target: number;
}

export interface MoodEntry {
  date: string;
  value: number; // 1-5
  note: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  text: string;
}

export interface Grade {
  id: string;
  subjectId: string;
  title: string;
  value: number;
  max: number;
  date: string;
}

export interface GroupPost {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  joined: boolean;
  emoji: string;
  posts: GroupPost[];
}

export interface CommEvent {
  id: string;
  title: string;
  date: string;
  place: string;
  joined: boolean;
}

export interface Skill {
  id: string;
  group: "Acadêmicas" | "Pessoais" | "Extras" | "Linguagens e Comunicação";
  name: string;
  level: number; // 1-5
}

export interface Experience {
  id: string;
  title: string;
  detail: string;
}

export interface PersonalGoal {
  id: string;
  title: string;
  done: boolean;
}

export type Species = "Cão Robô" | "Gato Robô" | "Pássaro Robô" | "Dragão Robô" | "Tigre Robô" | "Cobra Robô";
export const SPECIES: Species[] = ["Cão Robô", "Gato Robô", "Pássaro Robô", "Dragão Robô", "Tigre Robô", "Cobra Robô"];

export interface Profile {
  name: string;
  age: number;
  city: string;
  civil: string;
  quote: string;
  about: string;
  tags: string[];
  interests: string[];
  projects: string[];
  education: { title: string; detail: string };
  avatar?: string; // data URL
  species: Species;
}

export interface Settings {
  theme: "claro" | "escuro" | "sistema";
  monthlyBudget: number;
  openingBalance: number;
  hideBalance: boolean;
  bank: { connected: boolean; name: string; lastSync: string };
  seenNotifs: string[];
}

export interface Stats {
  xp: number;
  activityDates: string[]; // dias com atividade de estudo
  pomodoros: number;
  focusMinutes: number;
  questionsAnswered: number;
  questionsCorrect: number;
  moodStreakBest: number;
}

export interface AppData {
  tasks: Task[];
  events: CalEvent[];
  subjects: Subject[];
  studyGoals: StudyGoal[];
  exams: Exam[];
  summaries: Summary[];
  formulas: Formula[];
  questions: Question[];
  simulados: Simulado[];
  schedule: ScheduleItem[];
  transactions: Transaction[];
  finGoals: FinGoal[];
  moods: MoodEntry[];
  journal: JournalEntry[];
  grades: Grade[];
  groups: Group[];
  commEvents: CommEvent[];
  skills: Skill[];
  experience: Experience[];
  personalGoals: PersonalGoal[];
  connections: string[]; // ids de estudantes conectados
  profile: Profile;
  settings: Settings;
  stats: Stats;
}
