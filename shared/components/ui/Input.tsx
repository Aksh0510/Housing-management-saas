import { useId, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export default function Input({
  label,
  hint,
  error,
  id,
  className = '',
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;
  const describedBy = [hint && !error ? descriptionId : undefined, error ? descriptionId : undefined]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text">
          {label}
          {props.required && <span className="ml-1 text-red-600" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : props['aria-invalid']}
        aria-describedby={describedBy ?? props['aria-describedby']}
        className={`min-h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-text placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-surface-light disabled:text-text-secondary ${
          error ? 'border-red-500' : 'border-border'
        } ${className}`.trim()}
        {...props}
      />
      {(hint || error) && (
        <p id={descriptionId} className={`text-xs ${error ? 'text-red-700' : 'text-text-secondary'}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
