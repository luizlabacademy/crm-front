import { useState } from "react";
import { ClipboardList, Clock, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ExpenseTabs, type TabDef } from "../components/ExpenseTabs";
import { AccountsTab } from "../components/AccountsTab";
import { PendingExpensesTab } from "../components/PendingExpensesTab";
import { PaidExpensesTab } from "../components/PaidExpensesTab";

const TABS: TabDef[] = [
  {
    key: "accounts",
    label: "Cadastro de Contas",
    icon: <ClipboardList size={14} />,
  },
  {
    key: "pending",
    label: "Despesas a Pagar",
    icon: <Clock size={14} />,
  },
  {
    key: "paid",
    label: "Despesas Pagas",
    icon: <CheckCircle2 size={14} />,
  },
];

export function ExpensesPage() {
  const [activeTab, setActiveTab] = useState("accounts");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Despesas"
        description="Gerencie contas, despesas pendentes e histórico de pagamentos."
      />

      <ExpenseTabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div>
        {activeTab === "accounts" && <AccountsTab />}
        {activeTab === "pending" && <PendingExpensesTab />}
        {activeTab === "paid" && <PaidExpensesTab />}
      </div>
    </div>
  );
}
