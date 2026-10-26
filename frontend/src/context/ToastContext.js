"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckIcon, CloseIcon, AlertIcon } from "@/components/Icons";

const ToastContext = createContext(null);

const STYLES = {
  success: { icon: CheckIcon, ring: "border-success/40", iconColor: "text-success" },
  error: { icon: AlertIcon, ring: "border-crimson-400/50", iconColor: "text-crimson-300" },
  info: { icon: AlertIcon, ring: "border-navy-400/50", iconColor: "text-navy-400" },
};

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message, type = "info") => {
      const id = nextId++;
      setToasts((list) => [...list, { id, message, type }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  // Same object between renders, so components can safely use it in effect dependencies
  const toast = useMemo(
    () => ({
      success: (message) => show(message, "success"),
      error: (message) => show(message, "error"),
      info: (message) => show(message, "info"),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-20 z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => {
          const { icon: Icon, ring, iconColor } = STYLES[t.type];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-xl border ${ring} bg-navy-850/95 px-4 py-3 text-sm shadow-2xl backdrop-blur`}
            >
              <Icon className={`mt-0.5 size-4 shrink-0 ${iconColor}`} />
              <p className="flex-1 text-ink">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="cursor-pointer text-subtle hover:text-ink"
                aria-label="Dismiss"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return context;
}
