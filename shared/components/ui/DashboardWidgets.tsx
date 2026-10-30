import Card from './Card';

interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
  tone?: 'primary' | 'green' | 'amber' | 'red';
}

const toneClasses = {
  primary: 'border-l-primary',
  green: 'border-l-secondary',
  amber: 'border-l-accent',
  red: 'border-l-red-500',
};

export function StatCard({ label, value, detail, tone = 'primary' }: StatCardProps) {
  return (
    <Card className={`border-l-4 ${toneClasses[tone]}`}>
      <p className="text-sm font-medium text-text-secondary">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-text">{value}</p>
      {detail && <p className="mt-1 text-xs text-text-secondary">{detail}</p>}
    </Card>
  );
}

interface BarChartProps {
  title: string;
  items: Array<{ label: string; value: number }>;
}

export function BarChart({ title, items }: BarChartProps) {
  const maximum = Math.max(...items.map((item) => item.value), 1);

  return (
    <Card title={title} contentClassName="space-y-4">
      {items.map(({ label, value }) => (
        <div key={label}>
          <div className="mb-1.5 flex justify-between gap-3 text-xs">
            <span className="text-text-secondary">{label}</span>
            <span className="font-medium text-text">{value.toLocaleString('en-IN')}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-primary-light" role="img" aria-label={`${label}: ${value}`}>
            <div className="h-full rounded-full bg-primary" style={{ width: `${(value / maximum) * 100}%` }} />
          </div>
        </div>
      ))}
    </Card>
  );
}

interface DonutChartProps {
  title: string;
  segments: Array<{ label: string; value: number; color: string }>;
}

export function DonutChart({ title, segments }: DonutChartProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  let runningTotal = 0;
  const gradient = segments.map((segment) => {
    const start = total === 0 ? 0 : (runningTotal / total) * 100;
    runningTotal += segment.value;
    const end = total === 0 ? 0 : (runningTotal / total) * 100;
    return `${segment.color} ${start}% ${end}%`;
  }).join(', ');

  return (
    <Card title={title} contentClassName="flex flex-wrap items-center justify-center gap-6">
      <div
        className="relative grid h-36 w-36 place-items-center rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
        role="img"
        aria-label={`${title}: ${segments.map(({ label, value }) => `${label} ${value}`).join(', ')}`}
      >
        <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center">
          <span>
            <strong className="block text-xl text-text">{total}</strong>
            <span className="text-xs text-text-secondary">Total</span>
          </span>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center gap-2 text-text-secondary">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
            {segment.label}<span className="ml-auto pl-2 font-medium text-text">{segment.value}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function PageTitle({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-text">{title}</h2>
        {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
      </div>
      {action}
    </div>
  );
}
