import { useState } from "react";
import { Mail, Phone, Save, Shield, User } from "lucide-react";
import { toast } from "sonner";

export function MyProfilePage() {
  const [fullName, setFullName] = useState("Atendente CRM");
  const [phone, setPhone] = useState("(11) 99999-1234");

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    toast.success("Perfil atualizado com sucesso!");
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Meu perfil</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Gerencie seus dados pessoais e informacoes de contato.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <img
            src="https://i.pravatar.cc/180?img=12"
            alt="Avatar do usuario"
            className="h-20 w-20 rounded-full border border-border object-cover"
          />
          <div>
            <p className="text-lg font-semibold text-foreground">{fullName}</p>
            <p className="text-sm text-muted-foreground">atendente@crm.local</p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-2xl border border-border bg-card p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <User size={13} />
              Nome completo
            </span>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <label className="space-y-1.5">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Phone size={13} />
              Telefone
            </span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Mail size={13} />
            E-mail
          </span>
          <input
            value="atendente@crm.local"
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Shield size={13} />
            Perfil de acesso
          </span>
          <input
            value="Atendente"
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
          />
        </label>

        <div className="pt-1">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Save size={15} />
            Salvar alteracoes
          </button>
        </div>
      </form>
    </div>
  );
}
