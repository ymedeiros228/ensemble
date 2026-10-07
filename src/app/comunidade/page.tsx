"use client";

import { useState } from "react";
import { CalendarDays, MapPin, MessageCircle, Plus, Send, Users } from "lucide-react";
import { Button, Card, Chip, EmptyState, Field, Modal, PageHeader, Tabs } from "@/components/ui";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/ui-store";
import { daysUntil, formatShort } from "@/lib/dates";
import type { Group } from "@/lib/types";

type Aba = "grupos" | "eventos";
const EMOJIS = ["📚", "🧪", "💻", "🎨", "🌎", "🎵", "⚽", "💬"];

export default function ComunidadePage() {
  const [tab, setTab] = useState<Aba>("grupos");
  return (
    <div>
      <PageHeader icon={Users} title="Comunidade" subtitle="Estude junto, troque ideias e participe de eventos." mood="comemorando" quote="Juntas vamos mais longe!" />
      <Tabs<Aba> tabs={[{ id: "grupos", label: "Grupos", icon: Users }, { id: "eventos", label: "Eventos", icon: CalendarDays }]} value={tab} onChange={setTab} />
      {tab === "grupos" ? <Grupos /> : <Eventos />}
    </div>
  );
}

function Grupos() {
  const groups = useStore((s) => s.groups);
  const toggleGroup = useStore((s) => s.toggleGroup);
  const addGroup = useStore((s) => s.addGroup);
  const [open, setOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const active = groups.find((g) => g.id === openId) ?? null;

  return (
    <>
      <div className="flex justify-end mb-3">
        <Button onClick={() => setOpen(true)}><Plus size={18} aria-hidden /> Criar grupo</Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((g) => (
          <Card key={g.id} as="article" className="flex flex-col">
            <div className="flex items-start gap-3">
              <span className="text-3xl grid place-items-center h-12 w-12 rounded-2xl bg-brandsoft" aria-hidden>{g.emoji}</span>
              <div className="min-w-0">
                <h3 className="font-extrabold text-ink">{g.name}</h3>
                <p className="text-xs text-muted">{g.members} {g.members === 1 ? "membro" : "membros"}</p>
              </div>
            </div>
            <p className="text-sm text-body mt-3 flex-1">{g.description}</p>
            <div className="flex gap-2 mt-4">
              <Button variant={g.joined ? "ghost" : "primary"} className="flex-1" onClick={() => { toggleGroup(g.id); toast(g.joined ? `Você saiu de ${g.name}` : `Você entrou em ${g.name} 🎉`); }}>
                {g.joined ? "Sair" : "Entrar"}
              </Button>
              {g.joined && (
                <Button variant="soft" onClick={() => setOpenId(g.id)} aria-label={`Abrir mural de ${g.name}`}>
                  <MessageCircle size={18} aria-hidden /> Mural
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
      {groups.length === 0 && <EmptyState text="Nenhum grupo ainda." action="Criar grupo" onAction={() => setOpen(true)} />}

      {open && <GroupModal onClose={() => setOpen(false)} onSave={(g) => { addGroup(g); toast("Grupo criado!"); setOpen(false); }} />}
      {active && <Mural group={active} onClose={() => setOpenId(null)} />}
    </>
  );
}

function GroupModal({ onClose, onSave }: { onClose: () => void; onSave: (g: { name: string; description: string; emoji: string }) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  return (
    <Modal open onClose={onClose} title="Criar grupo">
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (name.trim()) onSave({ name: name.trim(), description: description.trim() || "Grupo de estudos", emoji }); }}>
        <Field label="Nome"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Revisão de Química" maxLength={40} /></Field>
        <Field label="Descrição"><textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Sobre o que é o grupo?" maxLength={140} /></Field>
        <div>
          <span className="field">Ícone</span>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((em) => (
              <button type="button" key={em} onClick={() => setEmoji(em)} aria-pressed={emoji === em} className={`text-2xl h-11 w-11 rounded-xl border-2 ${emoji === em ? "border-brand bg-brandsoft" : "border-line bg-surface2"}`}>{em}</button>
            ))}
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={!name.trim()}>Criar e entrar</Button>
      </form>
    </Modal>
  );
}

function Mural({ group, onClose }: { group: Group; onClose: () => void }) {
  const postInGroup = useStore((s) => s.postInGroup);
  const [text, setText] = useState("");
  const send = () => {
    if (!text.trim()) return;
    postInGroup(group.id, text.trim());
    setText("");
  };
  return (
    <Modal open onClose={onClose} title={`${group.emoji} ${group.name}`} wide>
      <div className="flex gap-2 mb-4">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Escreva uma mensagem para o grupo…" aria-label="Mensagem" />
        <Button onClick={send} disabled={!text.trim()} aria-label="Enviar"><Send size={18} aria-hidden /></Button>
      </div>
      {group.posts.length === 0 ? (
        <EmptyState text="Ninguém postou ainda. Seja a primeira!" />
      ) : (
        <ul className="space-y-2">
          {group.posts.map((p) => (
            <li key={p.id} className="rounded-2xl bg-surface2 p-3">
              <div className="flex justify-between text-xs mb-1"><span className="font-extrabold text-brand">{p.author}</span><span className="text-muted">{formatShort(p.date)}</span></div>
              <p className="text-body break-words">{p.text}</p>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

function Eventos() {
  const events = useStore((s) => s.commEvents);
  const toggle = useStore((s) => s.toggleCommEvent);
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) return <EmptyState text="Nenhum evento por enquanto." />;
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {sorted.map((e) => {
        const d = daysUntil(e.date);
        return (
          <Card key={e.id} as="article">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-extrabold text-ink">{e.title}</h3>
              <Chip tone={d < 0 ? "blue" : d <= 3 ? "pink" : "green"}>{d < 0 ? "Encerrado" : d === 0 ? "Hoje" : `em ${d}d`}</Chip>
            </div>
            <p className="text-sm text-muted mt-2 flex items-center gap-1.5"><CalendarDays size={16} aria-hidden /> {formatShort(e.date)}</p>
            <p className="text-sm text-muted flex items-center gap-1.5"><MapPin size={16} aria-hidden /> {e.place}</p>
            <Button className="mt-4 w-full" variant={e.joined ? "ghost" : "primary"} disabled={d < 0} onClick={() => { toggle(e.id); toast(e.joined ? "Participação cancelada" : "Presença confirmada! 🎉"); }}>
              {e.joined ? "Cancelar participação" : "Vou participar"}
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
