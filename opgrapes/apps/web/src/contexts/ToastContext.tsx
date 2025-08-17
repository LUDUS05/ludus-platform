'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ToastContainer, type ToastProps } from '@opgrapes/ui/Toast';

type ToastType = NonNullable<ToastProps['type']>;

interface ToastContextValue {
  show: (message: string, options?: { title?: string; type?: ToastType; duration?: number }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const onClose = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, options?: { title?: string; type?: ToastType; duration?: number }) => {
      const id = Math.random().toString(36).slice(2);
      const toast: ToastProps = {
        id,
        message,
        title: options?.title,
        type: options?.type ?? 'info',
        duration: options?.duration ?? 4000,
        onClose,
      };
      setToasts((prev) => [toast, ...prev]);
    },
    [onClose]
  );

  const value = useMemo<ToastContextValue>(() => ({
    show,
    success: (message, title) => show(message, { title, type: 'success' }),
    error: (message, title) => show(message, { title, type: 'error', duration: 6000 }),
    info: (message, title) => show(message, { title, type: 'info' }),
    warning: (message, title) => show(message, { title, type: 'warning' }),
  }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={onClose} position="top-right" />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}


