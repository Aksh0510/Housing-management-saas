const indianCurrencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const indianDateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
});

const indianDateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Kolkata',
});

export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) {
    throw new RangeError('Currency amount must be a finite number.');
  }

  return indianCurrencyFormatter.format(amount);
}

function toDate(value: string | Date): Date {
  const date = value instanceof Date
    ? new Date(value.getTime())
    : /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00.000Z`)
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`Invalid date value: ${String(value)}`);
  }

  return date;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (value == null || value === '') {
    return '—';
  }

  return indianDateFormatter.format(toDate(value));
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (value == null || value === '') {
    return '—';
  }

  return indianDateTimeFormatter.format(toDate(value));
}
