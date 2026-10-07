"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowRight, BarChart3, BookOpen, Brain, CalendarDays, ChevronRight, Eye, EyeOff, Heart, Minus, PieChart, Plus,
  Sparkles, Star, Target, Users, Wallet, Wallet2, CalendarCheck, CircleCheckBig, type LucideIcon,
} from "lucide-react";
import { Card, Chip, IconBadge, ProgressBar, SectionTitle, SUBJECT_ICONS, cx, EmptyState } from "@/components/ui";
import { CATEGORY_TONE, TaskModal, TaskRow, TransactionModal } from "@/components/shared";
import { Mascot } from "@/components/Mascot";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui-store";
import { brl, daysUntil, todayISO } from "@/lib/dates";
import { balance, monthSpent } from "@/lib/finance";
import { MOODS } from "@/components/MoodModal";

const GRID: { href: string; title: string; desc: string; icon: LucideIcon; tone: string }[] = [
  { href: "/agenda", title: "Agenda", desc: "Seus compromissos e lembretes em um só lugar", icon: CalendarDays, tone: "blue" },
  { href: "/estudos", title: "Estudos", desc: "Cronograma, materiais e técnicas de estudo", icon: BookOpen, tone: "purple" },
  { href: "/notas", title: "Notas", desc: "Acompanhe seu desempenho", icon: BarChart3, tone: "pink" },
  { href: "/bem-estar", title: "Bem-estar", desc: "Cuide da sua saúde mental", icon: Heart, tone: "orange" },
  { href: "/habilidades", title: "Habilidades", desc: "Conecte-se com outros estudantes", icon: Users, tone: "green" },
  { href: "/comunidade", title: "Comunidade", desc: "Grupos, projetos e eventos", icon: Users, tone: "purple" },
  { href: "/financeiro", title: "Financeiro", desc: "Controle seus gastos e objetivos", icon: Wallet2, tone: "teal" },
  { href: "/perfil", title: "Meu Perfil", desc: "Personalize sua experiência", icon: Star, tone: "yellow" },
];

export default function HomePage() {
  const profile = useStore((s) => s.profile);
  const events = useStore((s) => s.events);
  const tasks = useStore((s) => s.tasks);
  const exams = useStore((s) => s.exams);
  const subjects = useStore((s) => s.subjects);
  const router = useRouter();
  const transactions = useStore((s) => s.transactions);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const moods = useStore((s) => s.moods);
  const phrase = useUI((s) => s.phrase);
  const setMoodOpen = useUI((s) => s.setMoodOpen);
  const [taskOpen, setTaskOpen] = useState(false);
  const [txKind, setTxKind] = useState<"receita" | "gasto" | null>(null);

  const today = todayISO();
  const todayEvents = useMemo(() => events.filter((e) => e.date === today).sort((a, b) => a.start.localeCompare(b.start)), [events, today]);
  const pending = useMemo(() => tasks.filter((t) => !t.done).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 4), [tasks]);
  const nextExams = useMemo(() => exams.filter((e) => daysUntil(e.date) >= 0).slice(0, 4), [exams]);
  const bal = useMemo(() => balance({ transactions, settings }), [transactions, settings]);
  const spent = useMemo(() => monthSpent(transactions), [transactions]);
  const todayMood = moods.find((m) => m.date === today);
  const budgetPct = settings.monthlyBudget ? (spent / settings.monthlyBudget) * 100 : 0;

  return (
    <div className="pt-1">
      {/* Boas-vindas + mascote */}
      <section className="relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 min-h-[190px]">
        <div className="pt-2 sm:pb-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-ink flex items-center gap-2">
            Olá{profile.name && profile.name !== "Usuário" ? `, ${profile.name.split(" ")[0]}` : ""}! <Sparkles className="text-brand" size={30} aria-hidden />
          </h1>
          <p className="text-xl sm:text-2xl text-ink font-semibold">Que bom te ver por aqui!</p>
          <p className="mt-1 max-w-sm text-muted sm:text-lg">
            Hoje é um ótimo dia para continuar construindo tudo o que você sonha. <Heart size={16} className="inline text-brand fill-brand" aria-hidden />
          </p>
        </div>
        <div className="relative self-end sm:self-auto flex items-end gap-0 mt-1 sm:mt-0">
          <p className="hand text-brand text-xl sm:text-2xl leading-6 max-w-[200px] sm:max-w-[250px] bg-solid/80 border border-line rounded-3xl rounded-br-md px-4 py-3 mb-20 mr-[-10px] shadow-sm">{phrase}</p>
          <Mascot species={profile.species} size={150} />
        </div>
      </section>

      {/* Humor */}
      <button
        onClick={() => setMoodOpen(true)}
        className="w-full mt-3 text-left card !bg-[linear-gradient(90deg,var(--brand-soft),var(--surface))] p-4 sm:p-5 flex items-center gap-4 hover:brightness-[1.02] transition"
      >
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand text-white shadow-lg">
          {todayMood ? <span className="text-4xl">{MOODS[todayMood.value - 1].emoji}</span> : <Brain size={34} aria-hidden />}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-xl font-extrabold text-ink">{todayMood ? "Você registrou seu humor hoje" : "Como você está hoje?"}</span>
          <span className="block text-muted">{todayMood ? `Hoje: ${MOODS[todayMood.value - 1].label}. Toque para mudar.` : "Seu bem-estar também importa. Tire um momento para você."}</span>
        </span>
        <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-solid px-5 py-3 font-bold text-brand shadow-sm shrink-0">
          {todayMood ? "Atualizar humor" : "Registrar humor"} <ArrowRight size={18} aria-hidden />
        </span>
        <ChevronRight className="sm:hidden text-brand shrink-0" aria-hidden />
      </button>

      {/* Grid de atalhos */}
      <nav aria-label="Módulos" className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {GRID.map((g) => (
          <Link key={g.href} href={g.href} className="card p-4 flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-lg transition group">
            <div className="flex items-start justify-between">
              <IconBadge icon={g.icon} tone={g.tone} size={52} />
              <ChevronRight size={18} className="text-muted group-hover:text-brand transition" aria-hidden />
            </div>
            <div>
              <div className="text-lg font-extrabold text-ink">{g.title}</div>
              <div className="text-sm text-muted leading-snug">{g.desc}</div>
            </div>
          </Link>
        ))}
      </nav>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        {/* Coluna esquerda */}
        <div className="space-y-4">
          <Card>
            <SectionTitle icon={CalendarCheck} title="Agenda de hoje" href="/agenda" action="Ver todos" />
            {todayEvents.length === 0 ? (
              <EmptyState text="Nenhum compromisso para hoje. Aproveite para descansar ou planejar!" action="Novo compromisso" onAction={() => router.push("/agenda")} />
            ) : (
              <ul className="relative">
                {todayEvents.map((e) => (
                  <li key={e.id}>
                    <Link href="/agenda" className="flex items-center gap-3 py-2.5 border-b border-line last:border-0 hover:bg-surface2/60 rounded-xl px-1">
                      <span className={cx("h-3 w-3 rounded-full shrink-0", `fill-${CATEGORY_TONE[e.category]}`)} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-xs text-muted">{e.start} – {e.end}</span>
                        <span className="block font-bold text-ink truncate">{e.title}</span>
                      </span>
                      <Chip tone={CATEGORY_TONE[e.category]}>{e.category}</Chip>
                      <ChevronRight size={16} className="text-muted" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Link href="/perfil" className="card !bg-[linear-gradient(100deg,var(--brand-soft),var(--surface))] p-4 flex items-center gap-3">
            <Sparkles className="text-brand shrink-0" size={30} aria-hidden />
            <p className="hand text-2xl text-ink leading-6">“{profile.quote}”</p>
          </Link>

          <Card>
            <SectionTitle icon={CircleCheckBig} title="Tarefas pendentes" href="/agenda" action="Ver todas" />
            {pending.length === 0 ? (
              <EmptyState text="Tudo concluído por aqui! 🎉" action="Nova tarefa" onAction={() => setTaskOpen(true)} />
            ) : (
              <ul>{pending.map((t) => <TaskRow key={t.id} task={t} />)}</ul>
            )}
          </Card>
        </div>

        {/* Coluna direita */}
        <div className="space-y-4">
          <Card>
            <SectionTitle icon={Wallet} title="Finanças" href="/financeiro" action="Ver detalhes" />
            <div className="text-sm text-muted">Saldo atual</div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-ink">{settings.hideBalance ? "R$ •••••" : brl(bal)}</span>
              <button onClick={() => updateSettings({ hideBalance: !settings.hideBalance })} aria-label={settings.hideBalance ? "Mostrar saldo" : "Ocultar saldo"} className="text-ink p-1">
                {settings.hideBalance ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-muted">Gastos do mês <b className="text-ink block">{brl(spent)}</b></span>
              <span className="text-muted text-right">Meta <b className="text-ink block">{brl(settings.monthlyBudget)}</b></span>
            </div>
            <div className="mt-2"><ProgressBar value={budgetPct} tone={budgetPct > 100 ? "pink" : "green"} label="Gastos do mês em relação à meta" /></div>
            {budgetPct > 100 && <p className="text-xs text-danger font-bold mt-1">Você passou da meta do mês.</p>}
            <div className="grid grid-cols-4 gap-2 mt-4">
              <button onClick={() => setTxKind("receita")} className="rounded-2xl border border-line bg-solid p-2 text-xs font-bold text-body flex flex-col items-center gap-1 hover:bg-surface2"><span className="tone-green grid h-8 w-8 place-items-center rounded-full"><Plus size={18} /></span>Adicionar receita</button>
              <button onClick={() => setTxKind("gasto")} className="rounded-2xl border border-line bg-solid p-2 text-xs font-bold text-body flex flex-col items-center gap-1 hover:bg-surface2"><span className="tone-pink grid h-8 w-8 place-items-center rounded-full"><Minus size={18} /></span>Registrar gasto</button>
              <Link href="/financeiro#metas" className="rounded-2xl border border-line bg-solid p-2 text-xs font-bold text-body flex flex-col items-center gap-1 hover:bg-surface2"><span className="tone-purple grid h-8 w-8 place-items-center rounded-full"><Target size={18} /></span>Metas</Link>
              <Link href="/financeiro?aba=relatorios" className="rounded-2xl border border-line bg-solid p-2 text-xs font-bold text-body flex flex-col items-center gap-1 hover:bg-surface2"><span className="tone-blue grid h-8 w-8 place-items-center rounded-full"><PieChart size={18} /></span>Relatórios</Link>
            </div>
          </Card>

          <Card>
            <SectionTitle icon={CalendarDays} title="Próximas provas" href="/notas#provas" action="Ver todas" />
            {nextExams.length === 0 ? (
              <EmptyState text="Nenhuma prova marcada." />
            ) : (
              <ul>
                {nextExams.map((e) => {
                  const n = daysUntil(e.date);
                  const subj = subjects.find((s) => s.name === e.subject);
                  const Icon = SUBJECT_ICONS[subj?.icon ?? "book"] ?? BookOpen;
                  return (
                    <li key={e.id}>
                      <Link href="/notas#provas" className="flex items-center gap-3 py-2.5 border-b border-line last:border-0">
                        <IconBadge icon={Icon} tone={subj?.color ?? "blue"} size={38} />
                        <span className="flex-1 min-w-0">
                          <span className="block font-bold text-ink">{e.subject}</span>
                          <span className="block text-xs text-muted">{e.date.split("-").reverse().slice(0, 2).join("/")}{e.notes ? ` · ${e.notes}` : ""}</span>
                        </span>
                        <Chip tone={n <= 3 ? "pink" : n <= 7 ? "blue" : "green"}>{n === 0 ? "Hoje" : `${n} dia${n === 1 ? "" : "s"}`}</Chip>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <TaskModal open={taskOpen} onClose={() => setTaskOpen(false)} />
      <TransactionModal open={txKind !== null} kind={txKind ?? "gasto"} onClose={() => setTxKind(null)} />
    </div>
  );
}
