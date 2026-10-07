"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowDown, ArrowUp, BarChart3, Clock, Download, Eye, EyeOff, GraduationCap, Landmark, Minus, PiggyBank, Plus, RefreshCw, Target, Trash2, Wallet, PieChart,
} from "lucide-react";
import { Button, Card, EmptyState, Field, Modal, PageHeader, ProgressBar, SectionTitle, cx } from "@/components/ui";
import { TransactionModal } from "@/components/shared";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/ui-store";
import { brl, formatNumeric, formatShort } from "@/lib/dates";
import { CATEGORY_STYLE, balance, byCategory, inRange, periodRange, spendBuckets, summarize, type Period } from "@/lib/finance";

const BANKS = ["Banco Digital Estrela", "Banco Aurora", "Nuvem Bank", "Caixa Econômica Federal", "Banco do Brasil", "Nubank"];

export default function FinanceiroPage() {
  return (
    <Suspense fallback={null}>
      <Financeiro />
    </Suspense>
  );
}

function ago(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `há ${mins} min`;
  const h = Math.round(mins / 60);
  return h < 24 ? `há ${h} h` : `há ${Math.round(h / 24)} d`;
}

function Financeiro() {
  const params = useSearchParams();
  const transactions = useStore((s) => s.transactions);
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const removeTx = useStore((s) => s.removeTransaction);
  const syncBank = useStore((s) => s.syncBank);
  const [period, setPeriod] = useState<Period>("30d");
  const [tx, setTx] = useState<"receita" | "gasto" | null>(null);
  const [bankOpen, setBankOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(params.get("aba") === "relatorios");
  const [allTx, setAllTx] = useState(false);

  const range = periodRange(period);
  const inPeriod = useMemo(() => inRange(transactions, range.from, range.to), [transactions, range.from, range.to]);
  const sum = useMemo(() => summarize(inPeriod), [inPeriod]);
  const cats = useMemo(() => byCategory(inPeriod), [inPeriod]);
  const buckets = useMemo(() => spendBuckets(inPeriod, range.from, range.to), [inPeriod, range.from, range.to]);
  const bal = balance({ transactions, settings });
  const recent = useMemo(() => [...transactions].sort((a, b) => b.date.localeCompare(a.date)), [transactions]);

  const sync = () => {
    syncBank();
    toast("Conta sincronizada ✓");
  };

  return (
    <div>
      <PageHeader icon={Wallet} title="Financeiro" subtitle="Controle seus gastos e conquiste seus objetivos." quote="Grandes sonhos exigem planejamento. Você consegue!" />

      {/* Conexão bancária */}
      <Card className="!bg-[linear-gradient(100deg,var(--brand-soft),var(--surface))] flex flex-wrap items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand text-white shrink-0"><Landmark size={32} aria-hidden /></span>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 text-sm font-bold text-ink">
            <span className={cx("h-2.5 w-2.5 rounded-full", settings.bank.connected ? "fill-green" : "fill-pink")} aria-hidden />
            {settings.bank.connected ? "Banco conectado" : "Nenhum banco conectado"}
          </div>
          <div className="text-xl font-extrabold text-ink">{settings.bank.connected ? settings.bank.name : "Conecte sua conta"}</div>
          {settings.bank.connected && (
            <button onClick={sync} className="inline-flex items-center gap-1.5 text-sm text-brand font-bold"><RefreshCw size={14} aria-hidden /> Sincronizado {ago(settings.bank.lastSync)}</button>
          )}
        </div>
        <p className="hidden md:block text-sm text-muted max-w-[220px]">
          {settings.bank.connected ? "Sua conta está conectada! Saldo e categorias são atualizados automaticamente." : "Conecte uma conta para sincronizar saldo e categorias."}
        </p>
        <Button variant="ghost" className="!bg-solid" onClick={() => setBankOpen(true)}>Gerenciar conexão</Button>
        <p className="w-full text-xs text-muted">Demonstração: a conexão bancária é simulada e nenhum dado real é acessado.</p>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <div className="space-y-4">
          <Card className="!bg-[linear-gradient(135deg,var(--brand-soft),var(--surface))]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3"><span className="tone-blue grid h-12 w-12 place-items-center rounded-2xl"><Wallet aria-hidden /></span><b className="text-ink text-lg">Saldo disponível</b></div>
              <button onClick={() => update({ hideBalance: !settings.hideBalance })} aria-label={settings.hideBalance ? "Mostrar saldo" : "Ocultar saldo"} className="grid h-10 w-10 place-items-center rounded-full bg-solid text-brand">{settings.hideBalance ? <EyeOff size={20} /> : <Eye size={20} />}</button>
            </div>
            <div className={cx("text-5xl font-extrabold mt-3", bal < 0 ? "text-danger" : "text-ink")}>{settings.hideBalance ? "R$ •••••" : brl(bal)}</div>
            <div className="text-sm text-brand font-semibold mt-1 inline-flex items-center gap-1"><Clock size={14} aria-hidden /> {settings.bank.connected ? `Atualizado ${ago(settings.bank.lastSync)}` : "Conta desconectada — dados manuais"}</div>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="text-ink font-extrabold text-lg flex items-center gap-2"><Clock size={20} className="text-brand" aria-hidden /> Resumo — {range.label}</h2>
              <select className="!w-auto !py-1.5 !text-sm" value={period} onChange={(e) => setPeriod(e.target.value as Period)} aria-label="Período">
                <option value="30d">Últimos 30 dias</option><option value="mes">Este mês</option><option value="mes-passado">Mês passado</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="tone-green rounded-2xl p-3"><ArrowUp className="mx-auto" size={22} aria-hidden /><div className="text-xs font-bold">Entradas</div><div className="font-extrabold">{brl(sum.income)}</div></div>
              <div className="tone-pink rounded-2xl p-3"><ArrowDown className="mx-auto" size={22} aria-hidden /><div className="text-xs font-bold">Gastos</div><div className="font-extrabold">{brl(sum.spent)}</div></div>
              <div className="tone-purple rounded-2xl p-3"><PiggyBank className="mx-auto" size={22} aria-hidden /><div className="text-xs font-bold">Economizado</div><div className="font-extrabold">{brl(sum.saved)}</div></div>
            </div>
          </Card>

          <Card>
            <SectionTitle icon={BarChart3} title="Seus gastos do período" />
            <SpendChart data={buckets} />
          </Card>

          <Card>
            <SectionTitle icon={Clock} title="Transações recentes" action={allTx ? "Ver menos" : "Ver todas"} onAction={() => setAllTx((v) => !v)} />
            {recent.length === 0 ? <EmptyState text="Nenhuma transação registrada." /> : (
              <ul>
                {(allTx ? recent : recent.slice(0, 4)).map((t) => (
                  <li key={t.id} className="flex items-center gap-3 py-2.5 border-b border-line last:border-0">
                    <span className={cx("grid h-11 w-11 shrink-0 place-items-center rounded-full text-lg", t.amount > 0 ? "tone-green" : `tone-${CATEGORY_STYLE[t.category]?.tone ?? "blue"}`)} aria-hidden>
                      {t.amount > 0 ? <ArrowUp size={20} /> : CATEGORY_STYLE[t.category]?.emoji ?? "•"}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-bold text-ink truncate">{t.title}</span>
                      <span className="block text-xs text-muted truncate">{t.note ? `${t.note} · ` : ""}{formatNumeric(t.date)}</span>
                    </span>
                    <b className={cx("shrink-0", t.amount > 0 ? "text-[var(--green-fg)]" : "text-danger")}>{t.amount > 0 ? "+" : "−"} {brl(Math.abs(t.amount))}</b>
                    <button onClick={() => { removeTx(t.id); toast("Transação excluída"); }} aria-label={`Excluir ${t.title}`} className="text-muted hover:text-danger p-1"><Trash2 size={15} /></button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <SectionTitle icon={PieChart} title="Seus gastos por categoria" />
            {cats.length === 0 ? <EmptyState text="Sem gastos neste período." /> : (
              <ul className="space-y-3">
                {cats.map((c) => (
                  <li key={c.category} className="flex items-center gap-3">
                    <span className={cx("grid h-11 w-11 shrink-0 place-items-center rounded-full", `tone-${CATEGORY_STYLE[c.category]?.tone ?? "blue"}`)} aria-hidden>{CATEGORY_STYLE[c.category]?.emoji ?? "•"}</span>
                    <span className="flex-1">
                      <span className="flex justify-between text-sm"><b className="text-ink">{c.category}</b><span className="text-body">{brl(c.value)} <span className="text-muted">{c.pct}%</span></span></span>
                      <ProgressBar value={c.pct} tone={CATEGORY_STYLE[c.category]?.tone ?? "blue"} label={`${c.category} ${c.pct}%`} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <SectionTitle icon={Clock} title="Ações rápidas" />
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setTx("receita")} className="tone-green rounded-2xl p-4 flex flex-col items-center gap-2 font-bold hover:brightness-95"><Plus size={26} aria-hidden /> Adicionar receita</button>
              <button onClick={() => setTx("gasto")} className="tone-pink rounded-2xl p-4 flex flex-col items-center gap-2 font-bold hover:brightness-95"><Minus size={26} aria-hidden /> Registrar gasto</button>
              <button onClick={() => document.getElementById("metas")?.scrollIntoView({ behavior: "smooth" })} className="tone-purple rounded-2xl p-4 flex flex-col items-center gap-2 font-bold hover:brightness-95"><Target size={26} aria-hidden /> Metas</button>
              <button onClick={() => setReportOpen(true)} className="tone-blue rounded-2xl p-4 flex flex-col items-center gap-2 font-bold hover:brightness-95"><BarChart3 size={26} aria-hidden /> Relatórios</button>
            </div>
          </Card>

          <FinGoals />
        </div>
      </div>

      <TransactionModal open={tx !== null} kind={tx ?? "gasto"} onClose={() => setTx(null)} />
      <BankModal open={bankOpen} onClose={() => setBankOpen(false)} />
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}

/* ---------- Gráfico de linha (SVG) ---------- */

function SpendChart({ data }: { data: { label: string; value: number }[] }) {
  const W = 420, H = 190, padL = 46, padR = 12, padT = 12, padB = 28;
  const max = Math.max(100, Math.ceil(Math.max(...data.map((d) => d.value), 0) / 100) * 100);
  const x = (i: number) => padL + (data.length === 1 ? (W - padL - padR) / 2 : (i / (data.length - 1)) * (W - padL - padR));
  const y = (v: number) => padT + (1 - v / max) * (H - padT - padB);
  const pts = data.map((d, i) => [x(i), y(d.value)] as const);

  let path = "";
  pts.forEach(([px, py], i) => {
    if (i === 0) { path = `M${px},${py}`; return; }
    const [qx, qy] = pts[i - 1];
    const cx1 = qx + (px - qx) / 2;
    path += ` C${cx1},${qy} ${cx1},${py} ${px},${py}`;
  });
  const area = pts.length ? `${path} L${pts[pts.length - 1][0]},${H - padB} L${pts[0][0]},${H - padB} Z` : "";
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));

  if (data.every((d) => d.value === 0)) return <EmptyState text="Sem gastos neste período." />;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Gráfico de gastos ao longo do período">
      <defs>
        <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--brand)" stopOpacity="0.28" /><stop offset="1" stopColor="var(--brand)" stopOpacity="0" /></linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeDasharray="3 4" />
          <text x={padL - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill="var(--muted)">R$ {t}</text>
        </g>
      ))}
      <path d={area} fill="url(#spendFill)" />
      <path d={path} fill="none" stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" />
      {pts.map(([px, py], i) => (
        <g key={i}>
          <circle cx={px} cy={py} r="5" fill="var(--surface-solid)" stroke="var(--brand)" strokeWidth="3"><title>{`${formatShort(data[i].label)}: ${brl(data[i].value)}`}</title></circle>
          <text x={px} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--muted)">{data[i].label.slice(8)}/{data[i].label.slice(5, 7)}</text>
        </g>
      ))}
    </svg>
  );
}

/* ---------- Metas financeiras ---------- */

function FinGoals() {
  const goals = useStore((s) => s.finGoals);
  const add = useStore((s) => s.addFinGoal);
  const deposit = useStore((s) => s.depositFinGoal);
  const remove = useStore((s) => s.removeFinGoal);
  const [open, setOpen] = useState(false);
  const [dep, setDep] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [value, setValue] = useState("");

  return (
    <Card id="metas">
      <SectionTitle icon={Target} title="Metas financeiras" action="Nova meta" onAction={() => setOpen(true)} />
      {goals.length === 0 ? <EmptyState text="Crie uma meta de economia, como a sua faculdade!" action="Nova meta" onAction={() => setOpen(true)} /> : (
        <ul className="space-y-4">
          {goals.map((g) => {
            const pct = Math.round((g.saved / g.target) * 100);
            return (
              <li key={g.id}>
                <div className="flex items-center gap-3">
                  <span className="tone-blue grid h-12 w-12 place-items-center rounded-2xl shrink-0"><GraduationCap aria-hidden /></span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-ink truncate">{g.title}</div>
                    <div className="text-sm text-muted">{brl(g.saved)} de {brl(g.target)}</div>
                  </div>
                  <span className="tone-blue rounded-full px-3 py-1 text-sm font-extrabold">{pct}%</span>
                </div>
                <div className="mt-2"><ProgressBar value={pct} label={`${g.title} ${pct}%`} /></div>
                {dep === g.id ? (
                  <form className="flex gap-2 mt-2" onSubmit={(e) => { e.preventDefault(); const n = Number(value.replace(",", ".")); if (n > 0) { deposit(g.id, n); toast(`${brl(n)} guardados! 🐷`); setValue(""); setDep(null); } }}>
                    <input autoFocus inputMode="decimal" placeholder="Valor a guardar" value={value} onChange={(e) => setValue(e.target.value)} aria-label="Valor a guardar" />
                    <Button type="submit">Guardar</Button>
                  </form>
                ) : (
                  <div className="flex gap-2 mt-2">
                    <Button variant="soft" className="!py-1.5" onClick={() => setDep(g.id)}><PiggyBank size={16} aria-hidden /> Guardar</Button>
                    <Button variant="ghost" className="!py-1.5" onClick={() => remove(g.id)} aria-label={`Excluir ${g.title}`}><Trash2 size={16} aria-hidden /></Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Nova meta financeira">
        <form className="space-y-3" onSubmit={(e) => {
          e.preventDefault();
          const t = Number(target.replace(",", "."));
          if (!title.trim() || !(t > 0)) { toast("Informe um valor-alvo maior que zero"); return; }
          add({ title: title.trim(), saved: 0, target: t });
          toast("Meta criada 🎯"); setTitle(""); setTarget(""); setOpen(false);
        }}>
          <Field label="Nome da meta"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Notebook novo" required /></Field>
          <Field label="Valor-alvo (R$)"><input inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="0,00" required /></Field>
          <Button type="submit" className="w-full">Criar meta</Button>
        </form>
      </Modal>
    </Card>
  );
}

/* ---------- Conexão bancária (simulada) ---------- */

function BankModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const bank = useStore((s) => s.settings.bank);
  const setBank = useStore((s) => s.setBank);
  const [choice, setChoice] = useState(bank.name);
  return (
    <Modal open={open} onClose={onClose} title="Gerenciar conexão">
      <div className="space-y-3">
        <p className="text-sm text-muted">Demonstração: escolha um banco para simular a conexão. Nenhum dado real é acessado.</p>
        <Field label="Banco"><select value={choice} onChange={(e) => setChoice(e.target.value)}>{BANKS.map((b) => <option key={b}>{b}</option>)}</select></Field>
        <Button className="w-full" onClick={() => { setBank({ connected: true, name: choice, lastSync: new Date().toISOString() }); toast(`Conectado a ${choice} ✓`); onClose(); }}>
          {bank.connected ? "Trocar / reconectar" : "Conectar"}
        </Button>
        {bank.connected && <Button variant="danger" className="w-full" onClick={() => { setBank({ connected: false }); toast("Banco desconectado"); onClose(); }}>Desconectar</Button>}
      </div>
    </Modal>
  );
}

/* ---------- Relatórios ---------- */

function ReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const transactions = useStore((s) => s.transactions);
  const cur = periodRange("mes");
  const prev = periodRange("mes-passado");
  const a = summarize(inRange(transactions, cur.from, cur.to));
  const b = summarize(inRange(transactions, prev.from, prev.to));
  const cats = byCategory(inRange(transactions, prev.from, cur.to));
  const rate = a.income ? Math.round(((a.income - a.spent) / a.income) * 100) : 0;

  const exportCsv = () => {
    const rows = [["Data", "Descrição", "Observação", "Categoria", "Valor"], ...transactions.map((t) => [t.date, t.title, t.note, t.category, t.amount.toFixed(2).replace(".", ",")])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = "ensemble-transacoes.csv"; link.click();
    URL.revokeObjectURL(url);
    toast("Relatório exportado 📄");
  };

  return (
    <Modal open={open} onClose={onClose} title="Relatórios" wide>
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        {[{ t: "Este mês", s: a }, { t: "Mês passado", s: b }].map(({ t, s }) => (
          <div key={t} className="rounded-2xl bg-surface2 p-4">
            <b className="text-ink">{t}</b>
            <div className="text-sm text-body mt-2 space-y-1">
              <div className="flex justify-between"><span>Entradas</span><b className="text-[var(--green-fg)]">{brl(s.income)}</b></div>
              <div className="flex justify-between"><span>Gastos</span><b className="text-danger">{brl(s.spent)}</b></div>
              <div className="flex justify-between"><span>Economizado</span><b className="text-ink">{brl(s.saved)}</b></div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-body mb-3">Taxa de economia este mês: <b className="text-ink">{rate}%</b> da renda.</p>
      <h3 className="font-extrabold text-ink mb-2">Maiores categorias de gasto (2 meses)</h3>
      <ul className="space-y-2 mb-4">
        {cats.slice(0, 5).map((c) => (
          <li key={c.category} className="flex items-center gap-3 text-sm"><span className="w-28 text-body">{c.category}</span><ProgressBar value={c.pct} tone={CATEGORY_STYLE[c.category]?.tone ?? "blue"} /><b className="w-24 text-right text-ink">{brl(c.value)}</b></li>
        ))}
        {cats.length === 0 && <li className="text-muted text-sm">Sem dados.</li>}
      </ul>
      <Button onClick={exportCsv} variant="soft" className="w-full"><Download size={16} aria-hidden /> Exportar transações (CSV)</Button>
    </Modal>
  );
}
