"use client";

import React from "react";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

export default function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-xs flex-col gap-2">
      {toasts.map((t) => {
        const open = t.open !== false;
        return (
          <div
            key={t.id}
            role="status"
            aria-hidden={!open}
            className={`pointer-events-auto w-full rounded-lg border p-4 shadow-lg flex items-start justify-between transform transition-all duration-300 ease-out ${
              open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
            } ${
              t.variant === "destructive"
                ? "bg-red-600 text-white border-red-700"
                : "bg-white text-slate-900 border-slate-200"
            }`}
          >
            <div className="mr-4 min-w-0">
              {t.title && <div className="mb-1 font-medium">{t.title}</div>}
              {t.description && <div className="text-sm opacity-90">{t.description}</div>}
            </div>
            <div className="ml-4 flex items-start">
              <button
                aria-label="Fechar"
                onClick={() => dismiss(t.id)}
                className="rounded-md p-1 hover:opacity-80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
