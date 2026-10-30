import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-900',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

export default function Badge({
  children,
  variant = 'neutral',
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
}
