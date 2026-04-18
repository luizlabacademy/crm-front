import { X } from "lucide-react";

export function PriceTableModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-6">
      <div className="relative w-full max-w-6xl rounded-2xl bg-white shadow-2xl overflow-auto max-h-[92vh]">
        <div className="flex items-center justify-between border-b px-8 py-6">
          <h2 className="text-xl font-semibold">Planos</h2>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-muted px-2 py-1 text-sm text-muted-foreground">Personal</div>
            <div className="rounded-full bg-muted/40 px-2 py-1 text-sm text-muted-foreground">Business</div>
            <button onClick={onClose} aria-label="Fechar" className="p-2 rounded hover:bg-gray-100">
              <X />
            </button>
          </div>
        </div>

        <div className="p-8">
          <p className="text-sm text-muted-foreground mb-6">
            Escolha um plano para habilitar recursos avançados como campanhas de marketing e landing pages.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Free */}
            <div className="rounded-xl border border-gray-100 p-6">
              <h3 className="text-2xl font-bold">Go</h3>
              <p className="text-sm text-muted-foreground">Free</p>
              <div className="mt-4 flex items-baseline gap-2">
                <div className="text-3xl font-extrabold">R$ 0</div>
                <div className="text-sm text-muted-foreground">/ mês</div>
              </div>
              <ul className="mt-6 space-y-2 text-sm">
                <li>CRM</li>
                <li>WhatsApp marketing (limitado)</li>
                <li>E-mail marketing (limitado)</li>
                <li>Automação básica</li>
                <li>Campanhas (desativadas)</li>
              </ul>
              <div className="mt-6">
                <button className="w-full rounded-full border px-4 py-2 text-sm">Selecionar</button>
              </div>
            </div>

            {/* Profissional Autônomo */}
            <div className="rounded-xl border border-gray-100 p-6">
              <h3 className="text-2xl font-bold">Plus</h3>
              <p className="text-sm text-muted-foreground">Profissional Autônomo</p>
              <div className="mt-4 flex items-baseline gap-2">
                <div className="text-3xl font-extrabold">R$ 39</div>
                <div className="text-sm text-muted-foreground">/ mês</div>
              </div>
              <ul className="mt-6 space-y-2 text-sm">
                <li>CRM completo</li>
                <li>WhatsApp marketing</li>
                <li>E-mail marketing</li>
                <li>Automação</li>
                <li>Campanhas</li>
              </ul>
              <div className="mt-6">
                <button className="w-full rounded-full border bg-white px-4 py-2 text-sm">Seu plano atual</button>
              </div>
            </div>

            {/* Empresarial */}
            <div className="rounded-xl border border-transparent bg-gradient-to-br from-indigo-50 to-white p-6 shadow-xl">
              <h3 className="text-2xl font-bold">Pro</h3>
              <p className="text-sm text-muted-foreground">Empresarial</p>
              <div className="mt-4 flex items-baseline gap-2">
                <div className="text-3xl font-extrabold">R$ 129</div>
                <div className="text-sm text-muted-foreground">/ mês</div>
              </div>
              <ul className="mt-6 space-y-2 text-sm">
                <li>Tudo do Plus</li>
                <li>Usuários e permissões</li>
                <li>Integrações avançadas</li>
                <li>Relatórios</li>
              </ul>
              <div className="mt-6">
                <button className="w-full rounded-full bg-indigo-600 px-4 py-2 text-sm text-white">Fazer upgrade para o Pro</button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button onClick={onClose} className="rounded bg-primary px-4 py-2 text-white">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UpgradeNeededModal({ open, onClose, onViewPlans }: { open: boolean; onClose: () => void; onViewPlans: () => void; }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold">Upgrade necessário</h3>
        <p className="mt-2 text-sm text-gray-600">
          Para ativar esta funcionalidade (campanhas de marketing ou landing page) é necessário realizar um upgrade no seu plano.
        </p>

        <div className="mt-6 flex gap-3">
          <button onClick={onViewPlans} className="flex-1 rounded-full bg-indigo-600 px-4 py-2 text-white">Ver planos agora</button>
          <button onClick={onClose} className="flex-1 rounded-full border px-4 py-2">Depois</button>
        </div>
      </div>
    </div>
  );
}

export default null as any;
