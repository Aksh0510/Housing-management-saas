import { useMemo, useSyncExternalStore } from 'react';
import Badge from '../../../shared/components/ui/Badge';
import Card from '../../../shared/components/ui/Card';
import { PageTitle, StatCard } from '../../../shared/components/ui/DashboardWidgets';
import useAuth from '../../../shared/hooks/useAuth';
import { billingService } from '../../../shared/services/billingService';
import { complaintService } from '../../../shared/services/complaintService';
import { visitorService } from '../../../shared/services/visitorService';

const recentActivity = [
  { title: 'Maintenance payment received', detail: 'Flat A-1204 · Anjali Mehta', time: '10:42 AM', kind: 'Payment' },
  { title: 'Complaint assigned', detail: 'Water leakage · Flat B-504', time: '10:15 AM', kind: 'Operations' },
  { title: 'Visitor checked in', detail: 'Guest of Flat C-301', time: '9:58 AM', kind: 'Security' },
  { title: 'New resident notice published', detail: 'Annual fire-safety inspection', time: 'Yesterday', kind: 'Notice' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const billingRevision = useSyncExternalStore(billingService.subscribe, billingService.getRevision);
  const visitorRevision = useSyncExternalStore(visitorService.subscribe, visitorService.getRevision);
  const complaintRevision = useSyncExternalStore(complaintService.subscribe, complaintService.getRevision);
  const bills = useMemo(() => user ? billingService.getBillsForUser(user) : [], [user, billingRevision]);
  const visitors = useMemo(() => user ? visitorService.getForGate(user) : [], [user, visitorRevision]);
  const complaints = useMemo(() => user ? complaintService.getForUser(user) : [], [user, complaintRevision]);
  const outstanding = bills.reduce((total, bill) => total + bill.amount - bill.paidAmount, 0);
  const paid = bills.reduce((total, bill) => total + bill.paidAmount, 0);
  const collectionsByPeriod = [...new Set(bills.map((bill) => bill.period))].sort().map((period) => {
    const periodBills = bills.filter((bill) => bill.period === period);
    return {
      period,
      paid: periodBills.reduce((total, bill) => total + bill.paidAmount, 0),
      due: periodBills.reduce((total, bill) => total + bill.amount - bill.paidAmount, 0),
    };
  });
  const maxPeriodTotal = Math.max(1, ...collectionsByPeriod.map((item) => item.paid + item.due));
  const activeVisitors = visitors.filter((visitor) => visitor.status === 'Inside').length;
  return (
    <div>
      <PageTitle title="Society dashboard" description="A quick view of your finances and operations today." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Outstanding dues" value={`₹${outstanding.toLocaleString('en-IN')}`} detail={`${bills.filter((bill) => bill.amount > bill.paidAmount).length} flats with a balance`} tone="amber" />
        <StatCard label="Collections recorded" value={`₹${paid.toLocaleString('en-IN')}`} detail="Mock receipts linked to bills" tone="green" />
        <StatCard label="Open complaints" value={String(complaints.filter((item) => item.status === 'Open' || item.status === 'In progress').length)} detail="Resident requests awaiting closure" tone="red" />
        <StatCard label="Visitors inside" value={String(activeVisitors)} detail="Live gate check-in status" />
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <Card title="Billing by period" description="Paid and outstanding totals calculated from the society bill records.">
          <div className="space-y-4">
            {collectionsByPeriod.map((item) => (
              <div key={item.period}>
                <div className="mb-1 flex justify-between gap-3 text-xs"><span className="font-medium">{item.period}</span><span className="text-text-secondary">Paid ₹{item.paid.toLocaleString('en-IN')} · Due ₹{item.due.toLocaleString('en-IN')}</span></div>
                <div className="flex h-2 overflow-hidden rounded-full bg-surface-light" aria-label={`${item.period}: paid ${item.paid}, due ${item.due}`}>
                  <span className="bg-secondary" style={{ width: `${(item.paid / maxPeriodTotal) * 100}%` }} />
                  <span className="bg-amber-400" style={{ width: `${(item.due / maxPeriodTotal) * 100}%` }} />
                </div>
              </div>
            ))}
            {collectionsByPeriod.length === 0 && <p className="text-sm text-text-secondary">No bills are available for this society.</p>}
            <div className="flex gap-4 border-t border-border pt-3 text-xs text-text-secondary"><span>● Paid</span><span>● Outstanding</span></div>
          </div>
        </Card>
        <Card title="Recent activity" description="Latest updates from your society">
          <ol className="space-y-5">
            {recentActivity.map((item, index) => (
              <li key={item.title} className="relative flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary ring-4 ring-primary-light" />
                {index < recentActivity.length - 1 && <span className="absolute left-[5px] top-4 h-[calc(100%+0.5rem)] w-px bg-border" />}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-text">{item.title}</p>
                    <span className="text-xs text-text-secondary">{item.time}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="text-xs text-text-secondary">{item.detail}</p>
                    <Badge variant={item.kind === 'Payment' ? 'success' : item.kind === 'Operations' ? 'warning' : 'neutral'}>{item.kind}</Badge>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
      <Card className="mt-5" title="Needs attention" description="Follow-up items for the committee">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['3 complaints', 'SLA review due today', 'text-red-700 bg-red-50'],
            ['7 invoices', 'Awaiting payment reconciliation', 'text-amber-900 bg-amber-50'],
            ['2 contracts', 'Renewal in the next 30 days', 'text-primary bg-primary-light'],
          ].map(([label, detail, color]) => <div key={label} className={`rounded-lg p-4 ${color}`}><p className="font-semibold">{label}</p><p className="mt-1 text-sm">{detail}</p></div>)}
        </div>
      </Card>
    </div>
  );
}
