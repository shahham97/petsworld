import React from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

interface InlineAlertProps {
  type?: "success" | "error" | "warning" | "info";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function InlineAlert({
  type = "info",
  title,
  children,
  className = "",
}: InlineAlertProps) {
  const styles = {
    success: {
      container: "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]",
      icon: <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" aria-hidden="true" />,
    },
    error: {
      container: "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]",
      icon: <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" aria-hidden="true" />,
    },
    warning: {
      container: "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]",
      icon: <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0" aria-hidden="true" />,
    },
    info: {
      container: "bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]",
      icon: <Info className="w-5 h-5 text-[#2563EB] shrink-0" aria-hidden="true" />,
    },
  }[type];

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 p-4 rounded-2xl border text-sm leading-relaxed ${styles.container} ${className}`}
    >
      <div className="mt-0.5">{styles.icon}</div>
      <div className="flex-1">
        {title && <div className="font-semibold mb-0.5">{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
}
