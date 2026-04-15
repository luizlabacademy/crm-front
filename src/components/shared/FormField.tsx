import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export function inputCls(hasError?: boolean, className?: string) {
  return cn(
    "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none",
    "focus:ring-2 focus:ring-ring focus:ring-offset-1",
    "disabled:opacity-50",
    hasError ? "border-destructive" : "border-input",
    className,
  );
}

export function Label({
  htmlFor,
  children,
  required,
  className,
}: {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("block text-sm font-medium", className)}
    >
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

export function Fieldset({
  legend,
  description,
  children,
  className,
}: {
  legend: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn("space-y-4", className)}>
      <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {legend}
      </legend>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {children}
    </fieldset>
  );
}

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputCls(false, className)} {...props} />;
}

export function TextAreaInput({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={inputCls(false, cn("min-h-24 resize-y", className))}
      {...props}
    />
  );
}

export function SelectInput({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={inputCls(false, className)} {...props} />;
}
