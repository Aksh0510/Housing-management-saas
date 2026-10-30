import { useMemo, useState, type FormEvent } from 'react';
import Badge from '../../shared/components/ui/Badge';
import Button from '../../shared/components/ui/Button';
import Card from '../../shared/components/ui/Card';
import Input from '../../shared/components/ui/Input';
import { PageTitle } from '../../shared/components/ui/DashboardWidgets';
import Table, { type TableColumn } from '../../shared/components/ui/Table';
import useAuth from '../../shared/hooks/useAuth';
import useToast from '../../shared/hooks/useToast';
import { documentService, type NocRequest } from '../../shared/services/documentService';

export default function DocumentsNoc() {
  const { user } = useAuth();
  const { error, success } = useToast();
  const [revision, setRevision] = useState(0);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const records = useMemo(() => user ? documentService.getRequests(user) : [], [user, revision]);
  const folders = useMemo(() => user ? documentService.getFolders(user) : [], [user]);
  const refresh = () => setRevision((value) => value + 1);
  const request = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const data = new FormData(event.currentTarget);
    try { documentService.request(user, String(data.get('purpose') ?? '')); event.currentTarget.reset(); refresh(); success('NOC request sent to the society office.'); }
    catch (reason) { error(reason instanceof Error ? reason.message : 'NOC request failed.'); }
  };
  const decide = (row: NocRequest, decision: 'Approved' | 'Rejected') => {
    if (!user) return;
    try { documentService.decide(user, row.id, decision, reasons[row.id] ?? 'Reviewed by society office'); refresh(); success(`NOC ${decision.toLowerCase()}.`); }
    catch (reason) { error(reason instanceof Error ? reason.message : 'NOC decision failed.'); }
  };
  const columns: TableColumn<NocRequest>[] = [
    { key: 'id', header: 'Request', render: (row) => <span>{row.id}<span className="block text-xs text-text-secondary">{row.residentName} · {row.flat}</span></span> },
    { key: 'purpose', header: 'Purpose' },
    { key: 'createdAt', header: 'Submitted', render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN') },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'Approved' ? 'success' : row.status === 'Pending' ? 'warning' : 'danger'}>{row.status}</Badge> },
    { key: 'decisionReason', header: 'Decision / preview', render: (row) => row.status === 'Approved' ? <details><summary className="cursor-pointer text-primary">Preview NOC</summary><p className="mt-2 rounded border p-3 text-xs">No Objection Certificate · {row.flat} · {row.purpose}<br />Approved: {row.decisionReason}</p></details> : row.decisionReason ?? '—' },
    { key: 'residentId', header: 'Admin action', render: (row) => user?.role === 'admin' && row.status === 'Pending' ? <div className="space-y-2"><Input aria-label={`Decision reason for ${row.id}`} value={reasons[row.id] ?? ''} onChange={(event) => setReasons((current) => ({ ...current, [row.id]: event.target.value }))} placeholder="Decision reason" /><div className="flex gap-2"><Button size="sm" onClick={() => decide(row, 'Approved')}>Approve</Button><Button size="sm" variant="outline" onClick={() => decide(row, 'Rejected')}>Reject</Button></div></div> : '—' },
  ];
  return <div><PageTitle title="Documents & NOC" description={user?.role === 'admin' ? 'Review resident NOC requests and publish the decision reason.' : 'Browse society document folders and request a no-objection certificate.'} />
    <div className="mb-4 grid gap-3 sm:grid-cols-3">{folders.map((folder) => <Card key={folder.name} title={folder.name}><p className="text-sm text-text-secondary">{folder.documents} files · Demo folder index</p></Card>)}</div>
    {user?.role === 'member' && <Card className="mb-4" title="Request NOC"><form onSubmit={request} className="flex flex-col gap-3 sm:flex-row sm:items-end"><Input name="purpose" label="Purpose" placeholder="e.g. Bank loan documentation" required minLength={5} /><Button type="submit">Submit NOC request</Button></form></Card>}
    <Card title={user?.role === 'admin' ? 'NOC approval queue' : 'My NOC requests'}><Table columns={columns} data={records} rowKey="id" caption="No objection certificate requests" emptyMessage="No NOC requests found." /></Card>
  </div>;
}
