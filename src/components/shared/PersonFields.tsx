/**
 * PersonFields – seção reutilizável para dados de pessoa física/jurídica,
 * contatos e endereços. Integra com react-hook-form via register/watch/setValue.
 */
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
  Path,
  PathValue,
} from "react-hook-form";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

export function Label({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium">
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  );
}

export function inputCls(hasError?: boolean) {
  return cn(
    "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none",
    "focus:ring-2 focus:ring-ring focus:ring-offset-1",
    "disabled:opacity-50",
    hasError ? "border-destructive" : "border-input",
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b border-border pb-1 mb-3">
      {children}
    </h3>
  );
}

// ─── PersonType toggle ────────────────────────────────────────────────────────

type PersonType = "physical" | "legal" | "none";

interface PersonTypeSwitchProps {
  value: PersonType;
  onChange: (v: PersonType) => void;
  disabled?: boolean;
}

export function PersonTypeSwitch({
  value,
  onChange,
  disabled,
}: PersonTypeSwitchProps) {
  const options: { label: string; value: PersonType }[] = [
    { label: "Sem dado de pessoa", value: "none" },
    { label: "Pessoa Física", value: "physical" },
    { label: "Pessoa Jurídica", value: "legal" },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm transition-colors",
            value === opt.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background hover:bg-accent",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── PhysicalFields ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PhysicalFields<T extends Record<string, any>>({
  register,
  errors,
  disabled,
  prefix = "physical",
}: {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  disabled?: boolean;
  prefix?: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = errors as Record<string, any>;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor={`${prefix}.fullName`}>Nome completo</Label>
        <input
          id={`${prefix}.fullName`}
          type="text"
          {...register(`${prefix}.fullName` as Path<T>)}
          disabled={disabled}
          className={inputCls(Boolean(e[prefix]?.fullName))}
        />
        <FieldError message={e[prefix]?.fullName?.message} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${prefix}.cpf`}>CPF</Label>
        <input
          id={`${prefix}.cpf`}
          type="text"
          placeholder="000.000.000-00"
          maxLength={14}
          {...register(`${prefix}.cpf` as Path<T>)}
          disabled={disabled}
          className={inputCls()}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${prefix}.birthDate`}>Data de nascimento</Label>
        <input
          id={`${prefix}.birthDate`}
          type="date"
          {...register(`${prefix}.birthDate` as Path<T>)}
          disabled={disabled}
          className={inputCls()}
        />
      </div>
    </div>
  );
}

// ─── LegalFields ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function LegalFields<T extends Record<string, any>>({
  register,
  errors,
  disabled,
  prefix = "legal",
}: {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  disabled?: boolean;
  prefix?: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = errors as Record<string, any>;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor={`${prefix}.corporateName`}>Razão social</Label>
        <input
          id={`${prefix}.corporateName`}
          type="text"
          {...register(`${prefix}.corporateName` as Path<T>)}
          disabled={disabled}
          className={inputCls(Boolean(e[prefix]?.corporateName))}
        />
        <FieldError message={e[prefix]?.corporateName?.message} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${prefix}.tradeName`}>Nome fantasia</Label>
        <input
          id={`${prefix}.tradeName`}
          type="text"
          {...register(`${prefix}.tradeName` as Path<T>)}
          disabled={disabled}
          className={inputCls()}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${prefix}.cnpj`}>CNPJ</Label>
        <input
          id={`${prefix}.cnpj`}
          type="text"
          placeholder="00.000.000/0000-00"
          maxLength={18}
          {...register(`${prefix}.cnpj` as Path<T>)}
          disabled={disabled}
          className={inputCls()}
        />
      </div>
    </div>
  );
}

// ─── ContactsField ────────────────────────────────────────────────────────────

export interface ContactRow {
  type: string;
  contactValue: string;
  primary: boolean;
  active: boolean;
}

interface ContactsFieldProps {
  contacts: ContactRow[];
  onChange: (contacts: ContactRow[]) => void;
  disabled?: boolean;
}

const CONTACT_TYPES = ["EMAIL", "PHONE", "WHATSAPP", "TELEGRAM", "OTHER"];

export function ContactsField({
  contacts,
  onChange,
  disabled,
}: ContactsFieldProps) {
  function add() {
    onChange([
      ...contacts,
      { type: "PHONE", contactValue: "", primary: false, active: true },
    ]);
  }

  function remove(index: number) {
    onChange(contacts.filter((_, i) => i !== index));
  }

  function update(
    index: number,
    field: keyof ContactRow,
    value: string | boolean,
  ) {
    const next = contacts.map((c, i) =>
      i === index ? { ...c, [field]: value } : c,
    );
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {contacts.map((contact, index) => (
        <div
          key={index}
          className="grid gap-2 sm:grid-cols-[120px_1fr_auto_auto_auto] items-center rounded-md border border-border p-3 bg-muted/20"
        >
          <select
            value={contact.type}
            onChange={(e) => update(index, "type", e.target.value)}
            disabled={disabled}
            className={inputCls()}
          >
            {CONTACT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={contact.contactValue}
            onChange={(e) => update(index, "contactValue", e.target.value)}
            placeholder="Valor do contato"
            disabled={disabled}
            className={inputCls()}
          />

          <label className="flex items-center gap-1.5 text-xs whitespace-nowrap">
            <input
              type="checkbox"
              checked={contact.primary}
              onChange={(e) => update(index, "primary", e.target.checked)}
              disabled={disabled}
              className="accent-primary h-3.5 w-3.5"
            />
            Principal
          </label>

          <label className="flex items-center gap-1.5 text-xs whitespace-nowrap">
            <input
              type="checkbox"
              checked={contact.active}
              onChange={(e) => update(index, "active", e.target.checked)}
              disabled={disabled}
              className="accent-primary h-3.5 w-3.5"
            />
            Ativo
          </label>

          <button
            type="button"
            onClick={() => remove(index)}
            disabled={disabled}
            className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        disabled={disabled}
        className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
      >
        <Plus size={14} />
        Adicionar contato
      </button>
    </div>
  );
}

// ─── AddressesField ───────────────────────────────────────────────────────────

export interface AddressRow {
  type: "RESIDENTIAL" | "COMMERCIAL";
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  postalCode: string;
  primary: boolean;
  active: boolean;
}

interface AddressesFieldProps {
  addresses: AddressRow[];
  onChange: (addresses: AddressRow[]) => void;
  disabled?: boolean;
}

const emptyAddress = (): AddressRow => ({
  type: "RESIDENTIAL",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  postalCode: "",
  primary: false,
  active: true,
});

export function AddressesField({
  addresses,
  onChange,
  disabled,
}: AddressesFieldProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  function add() {
    const next = [...addresses, emptyAddress()];
    onChange(next);
    setExpanded(next.length - 1);
  }

  function remove(index: number) {
    onChange(addresses.filter((_, i) => i !== index));
    setExpanded(null);
  }

  function update(
    index: number,
    field: keyof AddressRow,
    value: string | boolean,
  ) {
    onChange(
      addresses.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    );
  }

  return (
    <div className="space-y-3">
      {addresses.map((addr, index) => (
        <div
          key={index}
          className="rounded-md border border-border bg-muted/20 overflow-hidden"
        >
          <div
            className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-accent/30 transition-colors"
            onClick={() => setExpanded(expanded === index ? null : index)}
          >
            <span className="text-sm font-medium">
              {addr.type === "RESIDENTIAL" ? "Residencial" : "Comercial"} —{" "}
              {addr.street || "novo endereço"}
              {addr.primary && (
                <span className="ml-2 text-xs text-primary">(principal)</span>
              )}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(index);
                }}
                disabled={disabled}
                className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {expanded === index && (
            <div className="border-t border-border p-3 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Tipo</label>
                <select
                  value={addr.type}
                  onChange={(e) =>
                    update(
                      index,
                      "type",
                      e.target.value as "RESIDENTIAL" | "COMMERCIAL",
                    )
                  }
                  disabled={disabled}
                  className={inputCls()}
                >
                  <option value="RESIDENTIAL">Residencial</option>
                  <option value="COMMERCIAL">Comercial</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">CEP</label>
                <input
                  type="text"
                  value={addr.postalCode}
                  onChange={(e) => update(index, "postalCode", e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                  disabled={disabled}
                  className={inputCls()}
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium">Logradouro</label>
                <input
                  type="text"
                  value={addr.street}
                  onChange={(e) => update(index, "street", e.target.value)}
                  placeholder="Rua, Avenida..."
                  disabled={disabled}
                  className={inputCls()}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Número</label>
                <input
                  type="text"
                  value={addr.number}
                  onChange={(e) => update(index, "number", e.target.value)}
                  placeholder="123"
                  disabled={disabled}
                  className={inputCls()}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Complemento</label>
                <input
                  type="text"
                  value={addr.complement}
                  onChange={(e) => update(index, "complement", e.target.value)}
                  placeholder="Apto, Bloco..."
                  disabled={disabled}
                  className={inputCls()}
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium">Bairro</label>
                <input
                  type="text"
                  value={addr.neighborhood}
                  onChange={(e) =>
                    update(index, "neighborhood", e.target.value)
                  }
                  disabled={disabled}
                  className={inputCls()}
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={addr.primary}
                    onChange={(e) => update(index, "primary", e.target.checked)}
                    disabled={disabled}
                    className="accent-primary h-3.5 w-3.5"
                  />
                  Principal
                </label>
                <label className="flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={addr.active}
                    onChange={(e) => update(index, "active", e.target.checked)}
                    disabled={disabled}
                    className="accent-primary h-3.5 w-3.5"
                  />
                  Ativo
                </label>
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        disabled={disabled}
        className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
      >
        <Plus size={14} />
        Adicionar endereço
      </button>
    </div>
  );
}

// ─── Re-exports for convenience ───────────────────────────────────────────────

export type { PersonType };
// Needed for callers that use setValue with typed paths
export type { UseFormRegister, UseFormWatch, UseFormSetValue, PathValue };
