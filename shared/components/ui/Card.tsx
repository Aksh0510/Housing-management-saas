import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function Card({
  children,
  title,
  description,
  action,
  className = '',
  contentClassName = '',
}: CardProps) {
  const hasHeader = title != null || description != null || action != null;

  return (
    <section className={`rounded-lg border border-border bg-surface shadow-sm ${className}`.trim()}>
      {hasHeader && (
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            {title && <h2 className="text-base font-semibold text-text">{title}</h2>}
            {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={`p-5 ${contentClassName}`.trim()}>{children}</div>
    </section>
  );
}
