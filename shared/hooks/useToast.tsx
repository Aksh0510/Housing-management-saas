import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
let nextToastId = 0;

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const dismiss = (id: number) => {
    setMessages((current) => current.filter((message) => message.id !== id));
  };

  const toast = (message: string, variant: ToastVariant = 'info') => {
    if (!message.trim()) {
      throw new Error('Toast message must not be empty.');
    }

    const id = ++nextToastId;
    setMessages((current) => [...current, { id, message, variant }]);
  };

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (message) => toast(message, 'success'),
      error: (message) => toast(message, 'error'),
      info: (message) => toast(message, 'info'),
    }),
    [],
  );

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    const timers = messages.map(({ id }) => window.setTimeout(() => dismiss(id), 4000));
    return () => timers.forEach(window.clearTimeout);
  }, [messages]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
        {messages.map(({ id, message, variant }) => (
          <div
            key={id}
            className={`flex items-start justify-between gap-3 rounded-lg border bg-white px-4 py-3 text-sm shadow-lg ${
              variant === 'success'
                ? 'border-green-200 text-green-800'
                : variant === 'error'
                  ? 'border-red-200 text-red-800'
                  : 'border-blue-200 text-blue-800'
            }`}
            role={variant === 'error' ? 'alert' : 'status'}
          >
            <span>{message}</span>
            <button
              type="button"
              onClick={() => dismiss(id)}
              className="font-semibold opacity-70 hover:opacity-100"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider.');
  }

  return context;
}
