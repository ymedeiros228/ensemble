"use client";

import { useRef, useState } from "react";
import { Download, Moon, RotateCcw, Settings as SettingsIcon, Sun, Monitor, Trash2, Upload, Wallet } from "lucide-react";
import { Button, Card, Field, Modal, PageHeader, SectionTitle, cx } from "@/components/ui";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/ui-store";
import type { AppData, Settings } from "@/lib/types";

const THEMES: { id: Settings["theme"]; label: string; icon: typeof Sun }[] = [
  { id: "claro", label: "Claro", icon: Sun },
  { id: "escuro", label: "Escuro", icon: Moon },
  { id: "sistema", label: "Sistema", icon: Monitor },
];

const DATA_KEYS: (keyof AppData)[] = ["tasks", "events", "subjects", "profile", "settings", "stats", "transactions"];

export default function ConfiguracoesPage() {
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const resetToDemo = useStore((s) => s.resetToDemo);
  const clearAll = useStore((s) => s.clearAll);
  const importData = useStore((s) => s.importData);
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirm, setConfirm] = useState<null | "demo" | "clear">(null);
  const [budget, setBudget] = useState(String(settings.monthlyBudget));

  const exportJson = () => {
    const s = useStore.getState();
    const data = Object.fromEntries(Object.entries(s).filter(([, v]) => typeof v !== "function"));
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "ensemble-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    toast("Backup exportado 💾");
  };

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!DATA_KEYS.every((k) => k in parsed)) throw new Error("formato");
      importData(parsed as AppData);
      toast("Dados importados com sucesso!");
    } catch {
      toast("Arquivo inválido. Use um backup exportado pelo Ensemble.");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const saveBudget = () => {
    const v = Number(budget.replace(",", "."));
    if (Number.isNaN(v) || v < 0) return toast("Digite um valor válido");
    update({ monthlyBudget: v });
    toast("Orçamento atualizado");
  };

  return (
    <div>
      <PageHeader icon={SettingsIcon} title="Configurações" subtitle="Deixe o Ensemble do seu jeito." mood="calmo" />

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <SectionTitle title="Aparência" />
          <div role="radiogroup" aria-label="Tema" className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => (
              <button key={t.id} role="radio" aria-checked={settings.theme === t.id} onClick={() => update({ theme: t.id })}
                className={cx("flex flex-col items-center gap-1 rounded-2xl p-3 border-2 font-bold text-sm transition", settings.theme === t.id ? "border-brand bg-brandsoft text-brand" : "border-line bg-surface2 text-body")}>
                <t.icon size={22} aria-hidden /> {t.label}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Wallet} title="Financeiro" />
          <Field label="Orçamento mensal (R$)">
            <div className="flex gap-2">
              <input inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveBudget()} />
              <Button onClick={saveBudget}>Salvar</Button>
            </div>
          </Field>
          <label className="flex items-center gap-2 mt-3 text-sm font-semibold text-ink">
            <input type="checkbox" checked={settings.hideBalance} onChange={(e) => update({ hideBalance: e.target.checked })} className="!w-auto" />
            Ocultar saldo por padrão
          </label>
        </Card>

        <Card>
          <SectionTitle title="Seus dados" />
          <p className="text-sm text-muted mb-3">Tudo fica salvo apenas neste navegador. Exporte um backup para guardar ou levar para outro computador.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="soft" onClick={exportJson}><Download size={18} aria-hidden /> Exportar</Button>
            <Button variant="soft" onClick={() => fileRef.current?.click()}><Upload size={18} aria-hidden /> Importar</Button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" aria-label="Arquivo de backup" onChange={(e) => onImport(e.target.files?.[0])} />
          </div>
        </Card>

        <Card>
          <SectionTitle title="Zona de risco" />
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setConfirm("demo")}><RotateCcw size={18} aria-hidden /> Restaurar demonstração</Button>
            <Button variant="danger" onClick={() => setConfirm("clear")}><Trash2 size={18} aria-hidden /> Apagar tudo</Button>
          </div>
        </Card>
      </div>

      {confirm && (
        <Modal open onClose={() => setConfirm(null)} title={confirm === "demo" ? "Restaurar demonstração?" : "Apagar tudo?"}>
          <p className="text-body mb-4">
            {confirm === "demo" ? "Seus dados atuais serão substituídos pelos dados de exemplo." : "Todos os seus dados serão removidos e o app começa vazio. Não dá para desfazer (a menos que você tenha um backup)."}
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setConfirm(null)}>Cancelar</Button>
            <Button variant="danger" onClick={() => { if (confirm === "demo") resetToDemo(); else clearAll(); setConfirm(null); toast(confirm === "demo" ? "Demonstração restaurada" : "Dados apagados"); }}>Confirmar</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
