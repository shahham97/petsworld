import React from "react";
import { AlertCircle } from "lucide-react";

interface FieldErrorProps {
  error?: string | string[];
  id?: string;
}

export function FieldError({ error, id }: FieldErrorProps) {
  if (!error) return null;

  const errorMessage = Array.isArray(error) ? error[0] : error;
  if (!errorMessage) return null;

  return (
    <div
      id={id}
      aria-live="polite"
      className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-[#DC2626]"
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{errorMessage}</span>
    </div>
  );
}
