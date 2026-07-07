"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";

type ToastVariant = "success" | "error" | "info" | "warning";

type Toast = {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastContextValue = {
  toast: (toast: ToastInput) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const styles: Record<ToastVariant, { iconClass: string; border: string }> = {
  success: { iconClass: "text-[#16813f]", border: "border-[#ccefd9]" },
  error: { iconClass: "text-[#b91c1c]", border: "border-[#fecaca]" },
  info: { iconClass: "text-[#2557a7]", border: "border-[#bfdbfe]" },
  warning: { iconClass: "text-orange-600", border: "border-orange-200" },
};

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "info" }: ToastInput) => {
      const id = ++toastId;
      setToasts((currentToasts) => [
        ...currentToasts,
        { id, title, description, variant },
      ]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}

function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed right-4 top-4 z-[100] flex w-[min(380px,calc(100vw-32px))] flex-col gap-3">
      {toasts.map((toast) => {
        const variant = styles[toast.variant];

        return (
          <div
            key={toast.id}
            className={`rounded-2xl border ${variant.border} bg-white p-4 shadow-[0_18px_48px_rgba(15,23,42,0.16)]`}
            role="status"
          >
            <div className="flex gap-3">
              <ToastIcon variant={toast.variant} className={`mt-0.5 flex-shrink-0 ${variant.iconClass}`} />
              <div className="min-w-0 flex-1">
                <p className="text-[0.9rem] font-semibold text-[#0f172a]">{toast.title}</p>
                {toast.description && (
                  <p className="mt-1 text-[0.82rem] leading-relaxed text-[#667085]">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[#94a3b8] hover:bg-[#f8fafc] hover:text-[#475569]"
                aria-label="Fechar notificação"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ToastIcon({ variant, className }: { variant: ToastVariant; className: string }) {
  if (variant === "success") {
    return <CheckCircle2 className={className} size={18} aria-hidden="true" />;
  }

  if (variant === "error") {
    return <XCircle className={className} size={18} aria-hidden="true" />;
  }

  if (variant === "warning") {
    return <TriangleAlert className={className} size={18} aria-hidden="true" />;
  }

  return <Info className={className} size={18} aria-hidden="true" />;
}
