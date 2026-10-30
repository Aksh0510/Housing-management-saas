import { useMemo, useState, useSyncExternalStore, type FormEvent } from 'react';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import Card from '../../../../shared/components/ui/Card';
import Input from '../../../../shared/components/ui/Input';
import Modal from '../../../../shared/components/ui/Modal';
import { PageTitle, StatCard } from '../../../../shared/components/ui/DashboardWidgets';
import Table, { type TableColumn } from '../../../../shared/components/ui/Table';
import useAuth from '../../../../shared/hooks/useAuth';
import useToast from '../../../../shared/hooks/useToast';
import { complaintService, isComplaintStatus, type ComplaintStatus, type SocietyComplaint } from '../../../../shared/services/complaintService';

const nextStatus: Record<ComplaintStatus, ComplaintStatus | ''> = {
  Open: 'In progress',
  'In progress': 'Resolved',
  Resolved: 'Closed',
  Closed: '',
};

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function ComplaintsList() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const revision = useSyncExternalStore(complaintService.subscribe, complaintService.getRevision);
  const complaints = useMemo(() => user ? complaintService.getForUser(user) : [], [user, revision]);
  const [selected, setSelected] = useState<SocietyComplaint | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const filtered = complaints.filter((complaint) =>
    `${complaint.id} ${complaint.subject} ${complaint.resident} ${complaint.flat}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()) &&
    (statusFilter === 'All statuses' || complaint.status === statusFilter),
  );
  const active = complaints.filter((complaint) => complaint.status === 'Open' || complaint.status === 'In progress');
  const overdue = active.filter((complaint) => complaint.slaDueAt < new Date().toISOString());

  const updateComplaint = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !selected) return;
    const data = new FormData(event.currentTarget);
    const status = String(data.get('status') ?? '');
    if (!isComplaintStatus(status)) {
      error('Choose a valid complaint status.');
      return;
    }
    try {
      const updated = complaintService.update(user, selected.id, {
        status,
        assignedTo: String(data.get('assignedTo') ?? ''),
        note: String(data.get('note') ?? ''),
      });
      setSelected(updated);
      success(`${updated.id} updated. The resident timeline is now current.`);
    } catch (reason) {
      error(reason instanceof Error ? reason.message : 'The complaint update could not be saved.');
    }
  };

  const columns: TableColumn<SocietyComplaint>[] = [
    { key: 'id', header: 'Ticket', render: (row) => <div className="font-semibold">{row.id}<p className="text-xs font-normal text-text-secondary">{row.subject}</p></div> },
    { key: 'resident', header: 'Resident', render: (row) => <div>{row.resident}<p className="text-xs text-text-secondary">{row.flat}</p></div> },
    { key: 'category', header: 'Category' },
    { key: 'priority', header: 'Priority', render: (row) => <Badge variant={row.priority === 'High' ? 'danger' : row.priority === 'Normal' ? 'warning' : 'neutral'}>{row.priority}</Badge> },
    { key: 'slaDueAt', header: 'SLA', render: (row) => row.status !== 'Resolved' && row.status !== 'Closed' && row.slaDueAt < new Date().toISOString()
      ? <span className="font-semibold text-red-700">Overdue · {formatDate(row.slaDueAt)}</span>
      : <span className="text-text-secondary">{formatDate(row.slaDueAt)}</span> },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'Resolved' || row.status === 'Closed' ? 'success' : row.status === 'In progress' ? 'info' : 'warning'}>{row.status}</Badge> },
    { key: 'id', header: 'Action', render: (row) => <Button size="sm" variant="outline" onClick={() => setSelected(row)}>Review</Button> },
  ];

  return (
    <div>
      <PageTitle title="Complaints & helpdesk" description="Review resident requests, assign owners and record status updates." />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard label="Open / in progress" value={String(active.length)} detail="Across society demo records" tone="amber" />
        <StatCard label="SLA overdue" value={String(overdue.length)} detail="Needs society-team review" tone="red" />
        <StatCard label="Resolved" value={String(complaints.filter((item) => item.status === 'Resolved' || item.status === 'Closed').length)} detail="Resolution history retained" tone="green" />
      </div>
      <Card>
        <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_12rem]">
          <Input label="Search helpdesk" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ticket, resident or flat" />
          <label className="space-y-1.5 text-sm font-medium">Status<select className="min-h-10 w-full rounded-md border border-border bg-white px-3" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{['All statuses', 'Open', 'In progress', 'Resolved', 'Closed'].map((status) => <option key={status}>{status}</option>)}</select></label>
        </div>
        <Table columns={columns} data={filtered} rowKey="id" caption="Society helpdesk queue" />
        {filtered.length === 0 && <p className="p-5 text-sm text-text-secondary">{complaints.length ? 'No complaints match your filters.' : 'No resident requests have been submitted.'}</p>}
      </Card>
      <p className="mt-3 text-xs text-text-secondary">Demo status changes require an update note and are shared to the resident timeline. No external notification is sent.</p>

      <Modal isOpen={selected !== null} onClose={() => setSelected(null)} title={selected ? `${selected.id} · ${selected.subject}` : 'Review complaint'} description={selected ? `${selected.resident} · ${selected.flat} · ${selected.category}` : undefined} size="lg" footer={<Button variant="outline" onClick={() => setSelected(null)}>Close</Button>}>
        {selected && <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="flex flex-wrap gap-2"><Badge variant={selected.priority === 'High' ? 'danger' : selected.priority === 'Normal' ? 'warning' : 'neutral'}>{selected.priority} priority</Badge><Badge variant={selected.status === 'Resolved' || selected.status === 'Closed' ? 'success' : selected.status === 'In progress' ? 'info' : 'warning'}>{selected.status}</Badge></div>
            <p className="mt-4 rounded-lg bg-surface-light p-3 text-sm leading-6">{selected.description}</p>
            <p className="mt-3 text-xs text-text-secondary">Submitted {formatDate(selected.createdAt)} · SLA {formatDate(selected.slaDueAt)}</p>
            <h3 className="mt-5 text-sm font-semibold">Activity history</h3>
            <ol className="mt-3 space-y-3">{selected.events.map((item) => <li key={item.id} className="border-l-2 border-primary/20 pl-3"><p className="text-xs font-semibold">{item.status}</p><p className="mt-1 text-xs text-text-secondary">{item.note}</p><p className="mt-1 text-[10px] text-text-secondary">{item.actor} · {formatDate(item.createdAt)}</p></li>)}</ol>
          </div>
          {nextStatus[selected.status] ? <form onSubmit={updateComplaint} className="space-y-4 rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold">Record next step</h3>
            <label className="space-y-1.5 text-sm font-medium">Move to<select name="status" className="min-h-10 w-full rounded-md border border-border bg-white px-3" defaultValue={nextStatus[selected.status]}><option value={nextStatus[selected.status]}>{nextStatus[selected.status]}</option></select></label>
            <Input name="assignedTo" label="Assigned to" defaultValue={selected.assignedTo ?? ''} placeholder="Staff member or vendor" />
            <label className="space-y-1.5 text-sm font-medium">Update note<textarea name="note" rows={3} minLength={5} required className="mt-1.5 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="What changed? Add a note for the resident." /></label>
            <Button type="submit">Save status update</Button>
          </form> : <p className="rounded-lg bg-green-50 p-4 text-sm text-green-900">This request is closed. Its activity history remains available.</p>}
        </div>}
      </Modal>
    </div>
  );
}
