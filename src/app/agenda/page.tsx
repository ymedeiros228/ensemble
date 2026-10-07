"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, CalendarDays, ChevronLeft, ChevronRight, CircleCheckBig, Plus } from "lucide-react";
import { Button, Card, Chip, EmptyState, PageHeader, SectionTitle, cx } from "@/components/ui";
import { CATEGORY_TONE, EventModal, TaskModal, TaskRow } from "@/components/shared";
import { useStore } from "@/lib/store";
import { DIAS_CURTOS, daysInMonth, formatLong, monthName, toISO, todayISO } from "@/lib/dates";
import type { CalEvent } from "@/lib/types";

export default function AgendaPage() {
  const events = useStore((s) => s.events);
  const tasks = useStore((s) => s.tasks);
  const removeTask = useStore((s) => s.removeTask);
  const today = todayISO();
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState(today);
  const [showAll, setShowAll] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [editing, setEditing] = useState<CalEvent | null>(null);
  const [taskOpen, setTaskOpen] = useState(false);

  const byDate = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    events.forEach((e) => map.set(e.date, [...(map.get(e.date) ?? []), e]));
    map.forEach((list) => list.sort((a, b) => a.start.localeCompare(b.start)));
    return map;
  }, [events]);

  // células do mês (com dias do mês anterior/seguinte para completar semanas)
  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1).getDay();
    const dim = daysInMonth(cursor.y, cursor.m);
    const total = Math.ceil((first + dim) / 7) * 7;
    return Array.from({ length: total }, (_, i) => {
      const date = new Date(cursor.y, cursor.m, i - first + 1);
      return { iso: toISO(date), day: date.getDate(), inMonth: date.getMonth() === cursor.m };
    });
  }, [cursor]);

  const move = (delta: number) => {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };
  const goToday = () => {
    setCursor({ y: now.getFullYear(), m: now.getMonth() });
    setSelected(today);
  };

  const dayEvents = byDate.get(selected) ?? [];
  const upcoming = useMemo(
    () => events.filter((e) => e.date >= today).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)).slice(0, 30),
    [events, today],
  );
  const shownTasks = useMemo(
    () => tasks.filter((t) => showDone || !t.done).sort((a, b) => Number(a.done) - Number(b.done) || a.due.localeCompare(b.due)),
    [tasks, showDone],
  );

  const openNew = () => { setEditing(null); setEventOpen(true); };
  const openEdit = (e: CalEvent) => { setEditing(e); setEventOpen(true); };

  return (
    <div>
      <PageHeader icon={CalendarDays} title="Agenda" subtitle="Organize seus compromissos, estudos e tarefas." quote="Grandes conquistas começam com bons planos." />

      <Card className="!p-3 sm:!p-5">
        <div className="flex items-center justify-between mb-3 bg-brandsoft/60 rounded-2xl px-2 py-2">
          <button onClick={() => move(-1)} aria-label="Mês anterior" className="grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-solid"><ChevronLeft /></button>
          <h2 className="text-lg sm:text-2xl font-extrabold text-ink uppercase tracking-wide" aria-live="polite">{monthName(cursor.m)} {cursor.y}</h2>
          <div className="flex items-center gap-1">
            <button onClick={goToday} className="hidden sm:inline-flex items-center gap-2 rounded-full bg-solid px-4 py-2 text-sm font-bold text-ink shadow-sm"><CalendarDays size={16} /> Hoje</button>
            <button onClick={() => move(1)} aria-label="Próximo mês" className="grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-solid"><ChevronRight /></button>
          </div>
        </div>
        <button onClick={goToday} className="sm:hidden mb-2 text-brand text-sm font-bold">Ir para hoje</button>

        <div className="grid grid-cols-7 text-center text-[0.7rem] sm:text-xs font-extrabold text-muted mb-1" aria-hidden>
          {DIAS_CURTOS.map((d) => <div key={d} className="py-1 uppercase">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-px bg-line/60 rounded-2xl overflow-hidden border border-line" role="grid" aria-label={`Calendário de ${monthName(cursor.m)} de ${cursor.y}`}>
          {cells.map((c) => {
            const list = byDate.get(c.iso) ?? [];
            const isToday = c.iso === today;
            const isSel = c.iso === selected;
            return (
              <button
                key={c.iso}
                role="gridcell"
                aria-selected={isSel}
                aria-label={`${formatLong(c.iso)}${list.length ? `, ${list.length} compromisso${list.length > 1 ? "s" : ""}` : ""}`}
                onClick={() => { setSelected(c.iso); if (!c.inMonth) setCursor({ y: Number(c.iso.slice(0, 4)), m: Number(c.iso.slice(5, 7)) - 1 }); }}
                className={cx(
                  "min-h-[3.6rem] sm:min-h-[5.2rem] p-1 sm:p-2 text-left align-top flex flex-col gap-0.5 transition",
                  c.inMonth ? "bg-solid" : "bg-surface2/70 text-muted",
                  isSel && "!bg-brandsoft ring-2 ring-inset ring-brand",
                )}
              >
                <span className={cx("text-xs sm:text-sm font-bold w-6 h-6 grid place-items-center rounded-full", isToday ? "bg-brand text-white" : c.inMonth ? "text-ink" : "text-muted")}>{c.day}</span>
                {list.slice(0, 2).map((e) => (
                  <span key={e.id} className="hidden sm:flex items-center gap-1 text-[0.68rem] text-body truncate">
                    <span className={cx("h-2 w-2 rounded-full shrink-0", `fill-${CATEGORY_TONE[e.category]}`)} />
                    <span className="truncate">{e.category}</span>
                  </span>
                ))}
                {list.length > 2 && <span className="hidden sm:block text-[0.65rem] text-muted">+{list.length - 2}</span>}
                <span className="sm:hidden flex gap-0.5 flex-wrap">
                  {list.slice(0, 3).map((e) => <span key={e.id} className={cx("h-1.5 w-1.5 rounded-full", `fill-${CATEGORY_TONE[e.category]}`)} />)}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Card className="relative">
          <SectionTitle
            icon={CalendarCheck}
            title={selected === today ? "Agenda de hoje" : formatLong(selected)}
            action={showAll ? "Ver só o dia" : "Ver todos"}
            onAction={() => setShowAll((v) => !v)}
          />
          {showAll ? (
            upcoming.length === 0 ? <EmptyState text="Nenhum compromisso futuro." /> : (
              <ul>
                {upcoming.map((e) => (
                  <EventRow key={e.id} e={e} onClick={() => openEdit(e)} showDate />
                ))}
              </ul>
            )
          ) : dayEvents.length === 0 ? (
            <EmptyState text="Nenhum compromisso neste dia." action="Novo compromisso" onAction={openNew} />
          ) : (
            <ul>{dayEvents.map((e) => <EventRow key={e.id} e={e} onClick={() => openEdit(e)} />)}</ul>
          )}
          <Button onClick={openNew} aria-label="Novo compromisso" className="!absolute -bottom-4 right-4 !h-14 !w-14 !rounded-full !p-0 shadow-xl"><Plus size={28} aria-hidden /></Button>
        </Card>

        <Card>
          <SectionTitle icon={CircleCheckBig} title="Tarefas pendentes" action={showDone ? "Só pendentes" : "Ver todas"} onAction={() => setShowDone((v) => !v)} />
          {shownTasks.length === 0 ? (
            <EmptyState text="Nenhuma tarefa por aqui." />
          ) : (
            <ul>{shownTasks.map((t) => <TaskRow key={t.id} task={t} showCategory onDelete={() => removeTask(t.id)} />)}</ul>
          )}
          <Button variant="soft" className="mt-3 w-full" onClick={() => setTaskOpen(true)}><Plus size={16} aria-hidden /> Nova tarefa</Button>
        </Card>
      </div>

      <EventModal open={eventOpen} onClose={() => setEventOpen(false)} event={editing} defaultDate={selected} />
      <TaskModal open={taskOpen} onClose={() => setTaskOpen(false)} />
    </div>
  );
}

function EventRow({ e, onClick, showDate = false }: { e: CalEvent; onClick: () => void; showDate?: boolean }) {
  return (
    <li>
      <button onClick={onClick} className="w-full flex items-center gap-3 py-2.5 border-b border-line last:border-0 text-left hover:bg-surface2/60 rounded-xl px-1">
        <span className={cx("h-3 w-3 rounded-full shrink-0", `fill-${CATEGORY_TONE[e.category]}`)} />
        <span className="flex-1 min-w-0">
          <span className="block text-xs text-muted">{showDate ? `${e.date.split("-").reverse().slice(0, 2).join("/")} · ` : ""}{e.start} – {e.end}</span>
          <span className="block font-bold text-ink truncate">{e.title}</span>
        </span>
        <Chip tone={CATEGORY_TONE[e.category]}>{e.category}</Chip>
        <ChevronRight size={16} className="text-muted" aria-hidden />
      </button>
    </li>
  );
}
