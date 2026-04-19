import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCustomers } from "@/features/customers/api/useCustomers";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50";

interface CustomerAutocompleteProps {
  tenantId: number | null;
  value: number | null | undefined;
  onChange: (id: number) => void;
  error?: string;
}

export function CustomerAutocomplete({
  tenantId,
  value,
  onChange,
  error,
}: CustomerAutocompleteProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const { data } = useCustomers({
    page: 0,
    size: 10,
    tenantId: tenantId ?? undefined,
  });
  const customers = data?.content ?? [];
  const filtered = search
    ? customers.filter((c) =>
        String(c.fullName ?? "")
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : customers;
  const selectedName = value
    ? (customers.find((c) => c.id === value)?.fullName ?? `ID ${value}`)
    : "";

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium">Cliente *</label>
      <div className="relative">
        <input
          type="text"
          value={open ? search : selectedName}
          onFocus={() => {
            setOpen(true);
            setSearch("");
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente..."
          className={cn(inputClass, error && "border-destructive")}
        />
        {open && filtered.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-card shadow-md text-sm">
            {filtered.map((c) => (
              <li
                key={c.id}
                className="cursor-pointer px-3 py-2 hover:bg-accent transition-colors"
                onMouseDown={() => {
                  onChange(c.id);
                  setOpen(false);
                }}
              >
                {c.fullName ?? `Cliente #${c.id}`}{" "}
                <span className="text-xs text-muted-foreground">#{c.id}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
