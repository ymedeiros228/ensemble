"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bell, BookOpen, CalendarDays, Heart, Home, Search, Settings, Target, User, Users, Wallet, BarChart3, X, CalendarCheck, GraduationCap, type LucideIcon,
} from "lucide-react";
import { Logo } from "./Logo";
import { Mascot } from "./Mascot";
import { MoodModal } from "./MoodModal";
import { cx } from "./ui";
import { useStore } from "@/lib/store";
import { MASCOT_PHRASES, useUI } from "@/lib/ui-store";
import { daysUntil, dueLabel, todayISO } from "@/lib/dates";

const SIDE: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Início", icon: Home },
  { href: "/perfil", label: "Meu Perfil", icon: User },
  { href: "/estudos", label: "Estudos", icon: BookOpen },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/financeiro", label: "Finanças", icon: Wallet },
  { href: "/notas", label: "Notas", icon: BarChart3 },
  { href: "/bem-estar", label: "Bem-estar", icon: Heart },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/comunidade", label: "Comunidade", icon: Users },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

const BOTTOM: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Início", icon: Home },
  { href: "/estudos", label: "Estudos", icon: BookOpen },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/perfil", label: "Perfil", icon: User },
];

function isActive(path: string, href: string) {
  return href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
}

function Avatar({ size = 40 }: { size?: number }) {
  const avatar = useStore((s) => s.profile.avatar);
  return (
    <span className="grid place-items-center rounded-full overflow-hidden bg-brandsoft text-brand shrink-0" style={{ width: size, height: size }}>
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt="Foto de perfil" className="h-full w-full object-cover" />
      ) : (
        <User size={size * 0.5} aria-hidden />
      )}
    </span>
  );
}

function useNotifications() {
  const tasks = useStore((s) => s.tasks);
  const exams = useStore((s) => s.exams);
  const events = useStore((s) => s.events);
  const moods = useStore((s) => s.moods);
  const seen = useStore((s) => s.settings.seenNotifs);

  return useMemo(() => {
    const today = todayISO();
    const list: { id: string; text: string; href: string; icon: LucideIcon }[] = [];
    tasks.filter((t) => !t.done && daysUntil(t.due) <= 1).forEach((t) =>
      list.push({ id: `task-${t.id}-${today}`, text: `Tarefa "${t.title}" — ${dueLabel(t.due)}`, href: "/agenda", icon: CalendarCheck }),
    );
    exams.filter((e) => daysUntil(e.date) >= 0 && daysUntil(e.date) <= 7).forEach((e) =>
      list.push({ id: `exam-${e.id}-${today}`, text: `Prova de ${e.subject} em ${daysUntil(e.date)} dia${daysUntil(e.date) === 1 ? "" : "s"}`, href: "/notas", icon: GraduationCap }),
    );
    events.filter((e) => e.date === today).slice(0, 2).forEach((e) =>
      list.push({ id: `ev-${e.id}-${today}`, text: `Hoje às ${e.start}: ${e.title}`, href: "/agenda", icon: CalendarDays }),
    );
    if (!moods.some((m) => m.date === today)) list.push({ id: `mood-${today}`, text: "Como você está hoje? Registre seu humor.", href: "/bem-estar", icon: Heart });
    return { list, unseen: list.filter((n) => !seen.includes(n.id)).length };
  }, [tasks, exams, events, moods, seen]);
}

function NotifPanel() {
  const { list } = useNotifications();
  const markSeen = useStore((s) => s.markNotifsSeen);
  const seen = useStore((s) => s.settings.seenNotifs);
  const setOpen = useUI((s) => s.setNotifOpen);
  return (
    <div className="pop absolute right-0 top-12 z-50 w-[min(92vw,360px)] card !bg-solid p-3 shadow-2xl" role="dialog" aria-label="Notificações">
      <div className="flex items-center justify-between px-2 pb-2">
        <strong className="text-ink">Notificações</strong>
        <button className="text-brand text-sm font-bold" onClick={() => markSeen(list.map((n) => n.id))}>Marcar como lidas</button>
      </div>
      {list.length === 0 ? (
        <p className="text-muted text-sm px-2 py-4 text-center">Tudo em dia por aqui! 🎉</p>
      ) : (
        <ul className="max-h-80 overflow-y-auto">
          {list.map((n) => (
            <li key={n.id}>
              <Link href={n.href} onClick={() => { setOpen(false); markSeen([n.id]); }} className="flex items-start gap-3 rounded-2xl p-2.5 hover:bg-surface2">
                <span className="tone-blue grid h-9 w-9 shrink-0 place-items-center rounded-xl"><n.icon size={18} aria-hidden /></span>
                <span className={cx("text-sm", seen.includes(n.id) ? "text-muted" : "text-ink font-semibold")}>{n.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SearchBox() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const tasks = useStore((s) => s.tasks);
  const events = useStore((s) => s.events);
  const summaries = useStore((s) => s.summaries);
  const subjects = useStore((s) => s.subjects);
  const formulas = useStore((s) => s.formulas);
  const groups = useStore((s) => s.groups);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 2) return [];
    const has = (s: string) => s.toLowerCase().includes(t);
    return [
      ...tasks.filter((x) => has(x.title)).map((x) => ({ label: x.title, kind: "Tarefa", href: "/agenda" })),
      ...events.filter((x) => has(x.title)).slice(0, 4).map((x) => ({ label: x.title, kind: "Compromisso", href: "/agenda" })),
      ...summaries.filter((x) => has(x.title) || has(x.body)).map((x) => ({ label: x.title, kind: "Resumo", href: "/estudos?aba=resumos" })),
      ...formulas.filter((x) => has(x.title) || has(x.expr)).map((x) => ({ label: x.title, kind: "Fórmula", href: "/estudos?aba=formulas" })),
      ...subjects.filter((x) => has(x.name)).map((x) => ({ label: x.name, kind: "Matéria", href: "/estudos" })),
      ...groups.filter((x) => has(x.name)).map((x) => ({ label: x.name, kind: "Grupo", href: "/comunidade" })),
    ].slice(0, 8);
  }, [q, tasks, events, summaries, subjects, formulas, groups]);

  return (
    <div ref={ref} className="relative flex-1 max-w-xl">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar no Ensemble..."
        aria-label="Buscar no Ensemble"
        className="!rounded-full !pl-11 !bg-surface"
      />
      {q && (
        <button aria-label="Limpar busca" onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"><X size={16} /></button>
      )}
      {open && q.trim().length >= 2 && (
        <div className="pop absolute left-0 right-0 top-12 z-50 card !bg-solid p-2 shadow-2xl">
          {results.length === 0 ? (
            <p className="p-3 text-sm text-muted text-center">Nada encontrado para “{q}”.</p>
          ) : (
            results.map((r, i) => (
              <button key={i} onClick={() => { router.push(r.href); setOpen(false); setQ(""); }} className="w-full flex items-center justify-between gap-3 rounded-xl p-2.5 text-left hover:bg-surface2">
                <span className="text-ink font-semibold text-sm truncate">{r.label}</span>
                <span className="text-xs text-muted shrink-0">{r.kind}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function TopBar() {
  const { unseen } = useNotifications();
  const notifOpen = useUI((s) => s.notifOpen);
  const setNotifOpen = useUI((s) => s.setNotifOpen);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notifOpen) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [notifOpen, setNotifOpen]);

  return (
    <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 py-3">
      <Link href="/" aria-label="Ensemble — início" className="lg:hidden"><Logo size={36} /></Link>
      <div className="hidden lg:flex flex-1"><SearchBox /></div>
      <div className="flex-1 lg:hidden" />
      <div ref={ref} className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          aria-label={`Notificações${unseen ? `, ${unseen} novas` : ""}`}
          aria-expanded={notifOpen}
          className="relative grid h-11 w-11 place-items-center rounded-full bg-surface text-brand border border-line hover:bg-brandsoft"
        >
          <Bell size={22} aria-hidden />
          {unseen > 0 && <span className="absolute right-2 top-2 h-3 w-3 rounded-full bg-[var(--pink-fg)] ring-2 ring-[var(--surface-solid)]" />}
        </button>
        {notifOpen && <NotifPanel />}
      </div>
      <Link href="/perfil" aria-label="Meu perfil"><Avatar size={44} /></Link>
    </div>
  );
}

function Sidebar({ path }: { path: string }) {
  const species = useStore((s) => s.profile.species);
  const quote = useStore((s) => s.profile.quote);
  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col p-5 gap-2 border-r border-line bg-surface backdrop-blur-xl z-30">
      <Link href="/" aria-label="Ensemble — início" className="px-2 py-3"><Logo size={42} /></Link>
      <nav aria-label="Menu principal" className="flex flex-col gap-1 mt-2">
        {SIDE.map((i) => {
          const active = isActive(path, i.href);
          return (
            <Link
              key={i.href}
              href={i.href}
              aria-current={active ? "page" : undefined}
              className={cx("flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[0.95rem] font-bold transition", active ? "bg-brandsoft text-brand" : "text-body hover:bg-surface2")}
            >
              <i.icon size={20} aria-hidden /> {i.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col items-center text-center pt-4">
        <p className="hand text-brand text-xl leading-6 px-2">“{quote}”</p>
        <Mascot species={species} size={110} />
      </div>
    </aside>
  );
}

function BottomNav({ path }: { path: string }) {
  return (
    <nav aria-label="Navegação principal" className="lg:hidden fixed bottom-3 left-3 right-3 z-40 card !rounded-[1.6rem] !p-1.5 flex justify-between !bg-solid/95">
      {BOTTOM.map((i) => {
        const active = isActive(path, i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={cx("flex flex-col items-center gap-0.5 rounded-[1.2rem] px-3 py-2 min-w-[3.6rem] text-[0.7rem] font-bold transition", active ? "bg-brandsoft text-brand" : "text-muted")}
          >
            <i.icon size={22} aria-hidden />
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Toasts() {
  const toasts = useUI((s) => s.toasts);
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="pop rounded-full bg-[#14308a] text-white px-5 py-2.5 text-sm font-bold shadow-xl">{t.text}</div>
      ))}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [ready, setReady] = useState(false);
  const theme = useStore((s) => s.settings.theme);
  const setPhrase = useUI((s) => s.setPhrase);

  useEffect(() => {
    Promise.resolve(useStore.persist.rehydrate()).finally(() => {
      setPhrase(MASCOT_PHRASES[Math.floor(Math.random() * MASCOT_PHRASES.length)]);
      setReady(true);
    });
  }, [setPhrase]);

  useEffect(() => {
    const apply = () => {
      const dark = theme === "escuro" || (theme === "sistema" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    if (theme !== "sistema") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [path]);

  if (!ready) {
    return (
      <div className="min-h-dvh grid place-items-center">
        <div className="flex flex-col items-center gap-4" role="status" aria-label="Carregando">
          <Logo size={56} />
          <Mascot size={120} />
        </div>
      </div>
    );
  }

  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-xl focus:bg-solid focus:px-4 focus:py-2 focus:text-brand">
        Pular para o conteúdo
      </a>
      <Sidebar path={path} />
      <div className="lg:pl-64">
        <TopBar />
        <main id="conteudo" className="px-4 sm:px-6 lg:px-8 pb-32 lg:pb-12 max-w-[1280px] mx-auto">{children}</main>
      </div>
      <BottomNav path={path} />
      <MoodModal />
      <Toasts />
    </>
  );
}
