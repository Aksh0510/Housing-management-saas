import { useMemo, useSyncExternalStore } from 'react';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import { PageTitle, StatCard } from '../../../shared/components/ui/DashboardWidgets';
import useAuth from '../../../shared/hooks/useAuth';
import { billingService } from '../../../shared/services/billingService';
import { complaintService } from '../../../shared/services/complaintService';
import { visitorService } from '../../../shared/services/visitorService';

interface MemberDashboardProps {
  onBills: () => void;
  onVisitors: () => void;
  onComplaints: () => void;
}

const money = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

export default function MemberDashboard({ onBills, onVisitors, onComplaints }: MemberDashboardProps) {
  const { user } = useAuth();
  const billingRevision = useSyncExternalStore(billingService.subscribe, billingService.getRevision);
  const visitorRevision = useSyncExternalStore(visitorService.subscribe, visitorService.getRevision);
  const complaintRevision = useSyncExternalStore(complaintService.subscribe, complaintService.getRevision);
  const bills = useMemo(() => user ? billingService.getBillsForUser(user) : [], [user, billingRevision]);
  const visitors = useMemo(() => user ? visitorService.getForResident(user) : [], [user, visitorRevision]);
  const complaints = useMemo(() => user ? complaintService.getForUser(user) : [], [user, complaintRevision]);
  const outstanding = bills.reduce((total, bill) => total + bill.amount - bill.paidAmount, 0);
  const expectedVisitors = visitors.filter((visitor) => visitor.status === 'Pre-approved');
  const nextBill = bills.find((bill) => bill.status !== 'Paid');

  return (
    <div>
      <PageTitle title="Resident overview" description={`Your home, society updates and requests${user?.flat ? ` · ${user.wing}-${user.flat}` : ''}.`} />
      <Card className="mb-5 overflow-hidden border-0 bg-primary text-white" contentClassName="flex flex-wrap items-center justify-between gap-5">
        <div><p className="text-sm text-white/75">Outstanding dues · {user?.wing}-{user?.flat}</p><p className="mt-2 text-4xl font-semibold">{money(outstanding)}</p><p className="mt-2 text-sm text-white/75">{nextBill ? `${nextBill.period} maintenance · due ${nextBill.dueDate}` : 'No outstanding bills'}</p></div>
        <Button variant="outline" onClick={onBills}>{nextBill ? 'Review bills' : 'View payment history'}</Button>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open complaints" value={String(complaints.filter((complaint) => complaint.status === 'Open' || complaint.status === 'In progress').length)} detail="Status from your helpdesk requests" tone="amber" />
        <StatCard label="Visitors expected" value={String(expectedVisitors.length)} detail="Pre-approved for your flat" tone="primary" />
        <StatCard label="Upcoming booking" value="1" detail="Clubhouse · Saturday · demo" tone="green" />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card title="My active complaints" action={<Button size="sm" variant="ghost" onClick={onComplaints}>View complaints</Button>}>
          {complaints.length ? <ul className="space-y-3">{complaints.filter((complaint) => complaint.status !== 'Closed').slice(0, 3).map((complaint) => <li key={complaint.id} className="flex items-center justify-between gap-3 rounded-lg bg-surface-light p-3"><span><span className="block text-sm font-medium">{complaint.subject}</span><span className="text-xs text-text-secondary">{complaint.id}</span></span><Badge variant={complaint.status === 'Open' ? 'warning' : complaint.status === 'In progress' ? 'info' : 'success'}>{complaint.status}</Badge></li>)}</ul> : <p className="text-sm text-text-secondary">No complaints have been raised for your flat.</p>}
        </Card>
        <Card title="Pre-approved visitors" description="The gate team sees these entries">
          {expectedVisitors.length ? <ul className="space-y-3">{expectedVisitors.slice(0, 3).map((visitor) => <li key={visitor.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"><span className="text-sm font-medium">{visitor.name}<span className="block text-xs font-normal text-text-secondary">{visitor.purpose}</span></span><span className="text-right text-sm text-text-secondary">{new Date(visitor.expectedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></li>)}</ul> : <p className="text-sm text-text-secondary">No visitors pre-approved yet.</p>}
          <Button size="sm" variant="outline" className="mt-4" onClick={onVisitors}>Manage visitors</Button>
        </Card>
      </div>
      <p className="mt-4 text-xs text-text-secondary">All balances and visitor activity shown here are demo records. Payments are simulated and no real money is transferred.</p>
    </div>
  );
}
