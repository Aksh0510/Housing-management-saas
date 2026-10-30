import { useMemo, useState, useSyncExternalStore, type FormEvent } from 'react';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import Input from '../../../shared/components/ui/Input';
import Modal from '../../../shared/components/ui/Modal';
import { PageTitle, StatCard } from '../../../shared/components/ui/DashboardWidgets';
import Table, { type TableColumn } from '../../../shared/components/ui/Table';
import useAuth from '../../../shared/hooks/useAuth';
import useToast from '../../../shared/hooks/useToast';
import { visitorService, type SocietyVisitor } from '../../../shared/services/visitorService';

function formatExpectedAt(value: string) {
  return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function MemberVisitors() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const revision = useSyncExternalStore(visitorService.subscribe, visitorService.getRevision);
  const visitors = useMemo(() => user ? visitorService.getForResident(user) : [], [user, revision]);
  const [open, setOpen] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const formData = new FormData(event.currentTarget);
    try {
      visitorService.preApprove(user, {
        name: String(formData.get('name') ?? ''),
        phone: String(formData.get('phone') ?? ''),
        date: String(formData.get('date') ?? ''),
        time: String(formData.get('time') ?? ''),
        purpose: String(formData.get('purpose') ?? ''),
      });
      event.currentTarget.reset();
      setOpen(false);
      success('Visitor pre-approval is now available to the society gate team.');
    } catch (reason) {
      error(reason instanceof Error ? reason.message : 'The visitor could not be pre-approved.');
    }
  };

  const decidePending = (visitorId: string, approve: boolean) => {
    if (!user) return;
    try {
      const visitor = approve ? visitorService.approvePending(user, visitorId) : visitorService.rejectPending(user, visitorId);
      success(approve ? `${visitor.name} approved for gate entry.` : `${visitor.name} request rejected.`);
    } catch (reason) {
      error(reason instanceof Error ? reason.message : 'Visitor request could not be updated.');
    }
  };

  const columns: TableColumn<SocietyVisitor>[] = [
    { key: 'name', header: 'Visitor / sender', render: (row) => <div className="font-medium">{row.name}<p className="text-xs font-normal text-text-secondary">{row.phone || row.reference || 'Society entry'}</p></div> },
    { key: 'expectedAt', header: 'Expected / recorded', render: (row) => formatExpectedAt(row.expectedAt) },
    { key: 'purpose', header: 'Purpose' },
    { key: 'status', header: 'Gate status', render: (row) => <Badge variant={row.status === 'Inside' ? 'success' : row.status === 'Pre-approved' ? 'info' : row.status === 'Pending host approval' ? 'warning' : row.status === 'Rejected' ? 'danger' : 'neutral'}>{row.status}</Badge> },
    { key: 'id', header: 'Host action', render: (row) => row.status === 'Pending host approval' ? <div className="flex gap-2"><Button size="sm" onClick={() => decidePending(row.id, true)}>Approve</Button><Button size="sm" variant="outline" onClick={() => decidePending(row.id, false)}>Reject</Button></div> : '—' },
  ];

  return (
    <div>
      <PageTitle title="Visitors & deliveries" description={`Gate activity shared with your flat${user?.flat ? ` · ${user.wing}-${user.flat}` : ''}.`} action={<Button onClick={() => setOpen(true)}>Pre-approve visitor</Button>} />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard label="Expected" value={String(visitors.filter((visitor) => visitor.status === 'Pre-approved').length)} detail="Visible to the gate team" tone="primary" />
        <StatCard label="Currently inside" value={String(visitors.filter((visitor) => visitor.status === 'Inside').length)} detail="Updated by gate check-in/out" tone="green" />
        <StatCard label="Deliveries logged" value={String(visitors.filter((visitor) => visitor.status === 'Delivery logged').length)} detail="Recorded at the gate" tone="amber" />
      </div>
      <Card title="Your gate activity" description="Pre-approvals, visitor entry/exit and deliveries for your flat.">
        <Table columns={columns} data={visitors} rowKey="id" caption="Visitor activity for your flat" />
        {visitors.length === 0 && <p className="p-5 text-sm text-text-secondary">No visitor or delivery activity for this flat yet. Pre-approve a guest to share their details with the gate.</p>}
      </Card>
      <p className="mt-3 text-xs text-text-secondary">Demo data is held in memory. Gate changes are shared across the resident and staff views in this browser session.</p>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Pre-approve a visitor" description="The gate team can look up this visitor and record entry or exit." footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" form="visitor-preapproval">Save pre-approval</Button></>}>
        <form id="visitor-preapproval" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Input name="name" label="Visitor name" required autoFocus />
          <Input name="phone" label="Phone number" type="tel" inputMode="tel" pattern="\+?[0-9\s\-]{10,16}" title="Enter a phone number with 10 to 15 digits." required />
          <Input name="date" label="Expected date" type="date" min={new Date().toISOString().slice(0, 10)} required />
          <Input name="time" label="Expected time" type="time" required />
          <label className="space-y-1.5 text-sm font-medium sm:col-span-2">Purpose
            <select name="purpose" className="min-h-10 w-full rounded-md border border-border bg-white px-3" defaultValue="Guest">
              <option>Guest</option><option>Service visit</option><option>Delivery</option><option>Other</option>
            </select>
          </label>
        </form>
      </Modal>
    </div>
  );
}
