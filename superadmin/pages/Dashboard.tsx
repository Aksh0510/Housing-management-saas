import Card from '../../../shared/components/ui/Card';
import { BarChart, PageTitle, StatCard } from '../../../shared/components/ui/DashboardWidgets';
import Table, { type TableColumn } from '../../../shared/components/ui/Table';

interface Activity {
  id: string;
  title: string;
  detail: string;
  time: string;
}

const activities: Activity[] = [
  { id: 'a1', title: 'Society onboarded', detail: 'Greenview Residency · Pune', time: '12 min ago' },
  { id: 'a2', title: 'Subscription renewed', detail: 'Shree Ganesh CHS Ltd. · Pro plan', time: '1 hour ago' },
  { id: 'a3', title: 'Admin invitation sent', detail: 'Sai Residency RWA', time: 'Today, 9:42 AM' },
];

const activityColumns: TableColumn<Activity>[] = [
  { key: 'title', header: 'Activity', render: (row) => <span className="font-medium">{row.title}</span> },
  { key: 'detail', header: 'Details' },
  { key: 'time', header: 'When', align: 'right' },
];

export default function SuperAdminDashboard() {
  return (
    <div>
      <PageTitle title="Platform dashboard" description="A portfolio view of societies, subscriptions and onboarding activity." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total societies" value="128" detail="Across all plans" />
        <StatCard label="Active subscriptions" value="112" detail="87.5% of portfolio" tone="green" />
        <StatCard label="Trials" value="16" detail="Review upcoming renewals" tone="amber" />
        <StatCard label="Open support tickets" value="4" detail="Across 3 societies" tone="red" />
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <BarChart title="Societies by plan" items={[{ label: 'Pro', value: 68 }, { label: 'Starter', value: 44 }, { label: 'Enterprise', value: 16 }]} />
        <Card title="Recent platform activity" description="Latest onboarding and subscription events">
          <Table columns={activityColumns} data={activities} rowKey="id" caption="Recent platform activity" />
        </Card>
      </div>
      <Card className="mt-5" title="Portfolio health" description="Illustrative service indicators for the demo environment.">
        <div className="grid gap-4 sm:grid-cols-3">
          {[['Onboarding progress', '92%', 'bg-secondary'], ['Renewals due in 30 days', '7', 'bg-accent'], ['Societies needing attention', '3', 'bg-red-500']].map(([label, value, color]) => (
            <div key={label} className="flex items-center gap-3 rounded-lg bg-surface-light p-4">
              <span className={`h-3 w-3 rounded-full ${color}`} />
              <div><p className="text-sm text-text-secondary">{label}</p><p className="text-xl font-semibold">{value}</p></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
