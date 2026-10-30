import { useMemo, useState, useSyncExternalStore } from 'react';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import Card from '../../../../shared/components/ui/Card';
import { PageTitle, StatCard } from '../../../../shared/components/ui/DashboardWidgets';
import Table, { type TableColumn } from '../../../../shared/components/ui/Table';
import useAuth from '../../../../shared/hooks/useAuth';
import useToast from '../../../../shared/hooks/useToast';
import { visitorService, type SocietyVisitor } from '../../../../shared/services/visitorService';

function formatTime(value: string) {
  return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function VisitorLog() {
  const { user } = useAuth();
  const { error, success } = useToast();
  const [revisionLocal, setRevisionLocal] = useState(0);
  const revision = useSyncExternalStore(visitorService.subscribe, visitorService.getRevision);
  const visitors = useMemo(() => user ? visitorService.getForGate(user) : [], [user, revision, revisionLocal]);
  const decide = (id: string, approve: boolean) => {
    if (!user) return;
    try { approve ? visitorService.approvePending(user, id) : visitorService.rejectPending(user, id); setRevisionLocal((value) => value + 1); success(approve ? 'Host approval override recorded.' : 'Pending entry rejected.'); }
    catch (reason) { error(reason instanceof Error ? reason.message : 'Pending entry could not be updated.'); }
  };
  const columns: TableColumn<SocietyVisitor>[] = [
    { key: 'name', header: 'Visitor / delivery', render: (row) => <div className="font-medium">{row.name}<p className="text-xs font-normal text-text-secondary">{row.purpose} {row.phone && `· ${row.phone}`}</p></div> },
    { key: 'flat', header: 'Flat' },
    { key: 'residentName', header: 'Resident' },
    { key: 'expectedAt', header: 'Entry / expected', render: (row) => formatTime(row.checkedInAt ?? row.expectedAt) },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'Inside' ? 'success' : row.status === 'Pre-approved' ? 'info' : row.status === 'Pending host approval' ? 'warning' : row.status === 'Rejected' ? 'danger' : 'neutral'}>{row.status}</Badge> },
    { key: 'id', header: 'Override', render: (row) => row.status === 'Pending host approval' ? <div className="flex gap-2"><Button size="sm" onClick={() => decide(row.id, true)}>Manager approve</Button><Button size="sm" variant="outline" onClick={() => decide(row.id, false)}>Reject</Button></div> : '—' },
  ];
  return (
    <div>
      <PageTitle title="Security & entry" description="Society visitor activity and resident-approved entries." />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Inside now" value={String(visitors.filter((visitor) => visitor.status === 'Inside').length)} detail="Gate check-in/out status" tone="green" />
        <StatCard label="Pre-approved" value={String(visitors.filter((visitor) => visitor.status === 'Pre-approved').length)} detail="Awaiting gate arrival" tone="primary" />
        <StatCard label="Deliveries logged" value={String(visitors.filter((visitor) => visitor.status === 'Delivery logged').length)} detail="Linked to recipient flats" tone="amber" />
      </div>
      <Card title="Visitor log" description="The gate log reflects resident pre-approvals and check-in/out activity.">
        <Table columns={columns} data={visitors} rowKey="id" caption="Society visitor log" />
        {visitors.length === 0 && <p className="p-5 text-sm text-text-secondary">No visitor activity has been recorded.</p>}
      </Card>
    </div>
  );
}
