import { useEffect, useId, useRef, type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
} as const;

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const descriptionId = description ? `${generatedId}-description` : undefined;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }

    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClose={onClose}
      className={`m-auto w-[calc(100%-2rem)] ${sizeClasses[size]} rounded-xl border border-border bg-white p-0 text-text shadow-2xl backdrop:bg-black/50`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
          {description && <p id={descriptionId} className="mt-1 text-sm text-text-secondary">{description}</p>}
        </div>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="rounded-md px-2 py-1 text-xl leading-none text-text-secondary hover:bg-surface-light focus-visible:outline-2 focus-visible:outline-primary"
          aria-label="Close dialog"
        >
          ×
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
      {footer && <div className="flex justify-end gap-2 border-t border-border px-5 py-4">{footer}</div>}
    </dialog>
  );
}
