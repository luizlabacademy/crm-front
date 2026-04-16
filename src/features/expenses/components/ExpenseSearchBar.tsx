import { Search } from "lucide-react";
import { inputCls } from "@/components/shared/FormField";

interface ExpenseSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ExpenseSearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
}: ExpenseSearchBarProps) {
  return (
    <div className="relative">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls(false, "pl-9 h-9")}
      />
    </div>
  );
}
