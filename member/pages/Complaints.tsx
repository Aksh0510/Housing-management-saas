import { useMemo, useState, useSyncExternalStore, type FormEvent } from 'react';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import Input from '../../../shared/components/ui/Input';
import Modal from '../../../shared/components/ui/Modal';
import { PageTitle } from '../../../shared/components/ui/DashboardWidgets';
import Table, { type TableColumn } from '../../../shared/components/ui/Table';
import useAuth from '../../../shared/hooks/useAuth';
import useToast from '../../../shared/hooks/useToast';
import { complaintService, isComplaintPriority, type SocietyComplaint } from '../../../shared/services/complaintService';

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function MemberComplaints() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const revision = useSyncExternalStore(complaintService.subscribe, complaintService.getRevision);
  const tickets = useMemo(() => user ? complaintService.getForUser(user) : [], [user, revision]);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<SocietyComplaint | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const formData = new FormData(event.currentTarget);
    const priority = String(formData.get('priority') ?? '');
    if (!isComplaintPriority(priority)) {
      error('Choose a valid priority.');
      return;
    }
    try {
      const ticket = complaintService.create(user, {
        subject: String(formData.get('subject') ?? ''),
        category: String(formData.get('category') ?? 'General'),
        priority,
        description: String(formData.get('description') ?? ''),
      });
      event.currentTarget.reset();
      setCreateOpen(false);
      success(`${ticket.id} submitted. The society helpdesk can now see this request.`);
    } catch (reason) {
      error(reason instanceof Error ? reason.message : 'Your complaint could not be submitted.');
    }
  };

  const columns: TableColumn<SocietyComplaint>[] = [
    { key: 'id', header: 'Ticket', render: (row) => <span className="font-medium">{row.id}</span> },
    { key: 'subject', header: 'Issue', render: (row) => <span>{row.subject}<span className="block text-xs text-text-secondary">{row.category}</span></span> },
    { key: 'createdAt', header: 'Submitted', render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'Resolved' || row.status === 'Closed' ? 'success' : row.status === 'In progress' ? 'info' : 'warning'}>{row.status}</Badge> },
    { key: 'id', header: 'Details', render: (row) => <Button size="sm" variant="outline" onClick={() => setSelected(row)}>View timeline</Button> },
  ];

  return (
    <div>
      <PageTitle title="My complaints" description="Raise a request and follow its status and updates." action={<Button onClick={() => setCreateOpen(true)}>New complaint</Button>} />
      <Card title="Requests for your flat" description="Updates are shared with the society helpdesk.">
        <Table columns={columns} data={tickets} rowKey="id" caption="My society complaints" />
        {tickets.length === 0 && <p className="p-5 text-sm text-text-secondary">No requests yet. Create a complaint to contact the society team.</p>}
      </Card>
      <p className="mt-3 text-xs text-text-secondary">Demo complaints are scoped to your account. Status changes appear here when the society team updates the shared record.</p>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Submit a complaint" description="Include enough detail for the society team to triage this request." footer={<><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" form="new-complaint">Submit complaint</Button></>}>
        <form id="new-complaint" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium">Category<select name="category" className="min-h-10 w-full rounded-md border border-border bg-white px-3"><option>Plumbing</option><option>Electrical</option><option>Elevator</option><option>Security</option><option>Housekeeping</option><option>General</option></select></label>
          <label className="space-y-1.5 text-sm font-medium">Priority<select name="priority" className="min-h-10 w-full rounded-md border border-border bg-white px-3"><option>Normal</option><option>High</option><option>Low</option></select></label>
          <div className="sm:col-span-2"><Input name="subject" label="Issue summary" placeholder="Briefly describe the issue" minLength={5} required /></div>
          <label className="space-y-1.5 text-sm font-medium sm:col-span-2">Details<textarea name="description" rows={4} minLength={10} required className="mt-1.5 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="When did this begin? What should the team know?" /></label>
        </form>
      </Modal>
      <Modal isOpen={selected !== null} onClose={() => setSelected(null)} title={selected?.id ?? 'Complaint timeline'} description={selected?.subject} footer={<Button onClick={() => setSelected(null)}>Done</Button>}>
        {selected && <div>
          <div className="flex flex-wrap gap-2"><Badge variant={selected.priority === 'High' ? 'danger' : selected.priority === 'Normal' ? 'warning' : 'neutral'}>{selected.priority} priority</Badge><Badge variant={selected.status === 'Resolved' || selected.status === 'Closed' ? 'success' : selected.status === 'In progress' ? 'info' : 'warning'}>{selected.status}</Badge></div>
          <p className="mt-4 rounded-lg bg-surface-light p-3 text-sm leading-6">{selected.description}</p>
          <ol className="mt-5 space-y-4">{selected.events.map((item) => <li key={item.id} className="border-l-2 border-primary/20 pl-4"><p className="text-sm font-semibold">{item.status}</p><p className="mt-1 text-sm text-text-secondary">{item.note}</p><p className="mt-1 text-xs text-text-secondary">{item.actor} · {formatDate(item.createdAt)}</p></li>)}</ol>
        </div>}
      </Modal>
    </div>
  );
}
