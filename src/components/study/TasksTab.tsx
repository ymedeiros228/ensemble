"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button, Card, EmptyState, cx } from "@/components/ui";
import { TaskModal, TaskRow } from "@/components/shared";
import { useStore } from "@/lib/store";

type Filter = "pendentes" | "concluidas" | "todas";

export function TasksTab() {
  const tasks = useStore((s) => s.tasks);
  const remove = useStore((s) => s.removeTask);
  const [filter, setFilter] = useState<Filter>("pendentes");
  const [open, setOpen] = useState(false);

  const list = useMemo(
    () => tasks.filter((t) => (filter === "todas" ? true : filter === "pendentes" ? !t.done : t.done)).sort((a, b) => a.due.localeCompare(b.due)),
    [tasks, filter],
  );
  const done = tasks.filter((t) => t.done).length;

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex gap-1.5 bg-surface2 rounded-full p-1">
          {(["pendentes", "concluidas", "todas"] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cx("rounded-full px-4 py-1.5 text-sm font-bold capitalize", filter === f ? "bg-brand text-white" : "text-body")}>
              {f === "concluidas" ? "concluídas" : f}
            </button>
          ))}
        </div>
        <span className="text-sm text-muted">{done} de {tasks.length} concluídas</span>
        <Button onClick={() => setOpen(true)}><Plus size={16} aria-hidden /> Nova tarefa</Button>
      </div>
      {list.length === 0 ? <EmptyState text="Nenhuma tarefa nesta lista." action="Nova tarefa" onAction={() => setOpen(true)} /> : (
        <ul>{list.map((t) => <TaskRow key={t.id} task={t} showCategory onDelete={() => remove(t.id)} />)}</ul>
      )}
      <TaskModal open={open} onClose={() => setOpen(false)} />
    </Card>
  );
}
