import { useMemo, useState, useSyncExternalStore, type FormEvent } from 'react';
import Badge from '../../shared/components/ui/Badge';
import Button from '../../shared/components/ui/Button';
import Card from '../../shared/components/ui/Card';
import Input from '../../shared/components/ui/Input';
import { PageTitle } from '../../shared/components/ui/DashboardWidgets';
import Table, { type TableColumn } from '../../shared/components/ui/Table';
import useAuth from '../../shared/hooks/useAuth';
import useToast from '../../shared/hooks/useToast';
import { parkingService, type VehicleRecord } from '../../shared/services/parkingService';

export default function ParkingVehicles() {
  const { user } = useAuth();
  const { error, success } = useToast();
  const [revision, setRevision] = useState(0);
  const records = useMemo(() => user ? parkingService.getForUser(user) : [], [user, revision]);
  const refresh = () => setRevision((value) => value + 1);
  const request = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const data = new FormData(event.currentTarget);
    try { parkingService.request(user, { plate: String(data.get('plate') ?? ''), type: String(data.get('type') ?? '') }); event.currentTarget.reset(); refresh(); success('Parking request submitted for approval.'); }
    catch (reason) { error(reason instanceof Error ? reason.message : 'Parking request failed.'); }
  };
  const decide = (row: VehicleRecord, decision: 'Approved' | 'Rejected') => {
    if (!user) return;
    try { parkingService.decide(user, row.id, decision, decision === 'Approved' ? `P-${row.id.slice(-2)}` : 'Slot unavailable'); refresh(); success(`Vehicle request ${decision.toLowerCase()}.`); }
    catch (reason) { error(reason instanceof Error ? reason.message : 'Parking decision failed.'); }
  };
  const revoke = (id: string) => {
    if (!user) return;
    try { parkingService.revoke(user, id); refresh(); success('Parking allocation revoked.'); }
    catch (reason) { error(reason instanceof Error ? reason.message : 'Parking allocation could not be revoked.'); }
  };
  const columns: TableColumn<VehicleRecord>[] = [
    { key: 'plate', header: 'Vehicle' },
    { key: 'type', header: 'Type' },
    { key: 'flat', header: 'Flat' },
    { key: 'slot', header: 'Slot', render: (row) => row.slot ?? '—' },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'Approved' ? 'success' : row.status === 'Pending' ? 'warning' : 'neutral'}>{row.status}</Badge> },
    { key: 'id', header: 'Action', render: (row) => user?.role === 'admin' && row.status === 'Pending' ? <div className="flex gap-2"><Button size="sm" onClick={() => decide(row, 'Approved')}>Allocate & approve</Button><Button size="sm" variant="outline" onClick={() => decide(row, 'Rejected')}>Reject</Button></div> : user?.role === 'admin' && row.status === 'Approved' ? <Button size="sm" variant="outline" onClick={() => revoke(row.id)}>Revoke</Button> : '—' },
  ];
  return <div><PageTitle title="Parking & vehicles" description={user?.role === 'admin' ? 'Review resident applications, allocate slots and inspect allocation history.' : 'Register household vehicles and track parking approval.'} />
    {user?.role === 'member' && <Card className="mb-4" title="Request a vehicle slot"><form onSubmit={request} className="grid gap-3 sm:grid-cols-3"><Input name="plate" label="Vehicle registration" placeholder="MH 02 AB 1234" required /><label className="space-y-1.5 text-sm font-medium">Vehicle type<select name="type" className="min-h-10 w-full rounded-md border border-border bg-white px-3"><option>Car</option><option>Two-wheeler</option><option>Electric vehicle</option></select></label><div className="flex items-end"><Button type="submit">Submit request</Button></div></form></Card>}
    <Card title="Vehicle register" description="Slot changes retain their action history in the demo service."><Table columns={columns} data={records} rowKey="id" caption="Vehicle register" emptyMessage="No vehicles or parking requests found." />{records.map((record) => <details key={`${record.id}-history`} className="mt-3 text-xs text-text-secondary"><summary className="cursor-pointer">History · {record.plate}</summary><ul className="mt-2 space-y-1">{record.history.map((item, index) => <li key={index}>{item.action} · {new Date(item.at).toLocaleString('en-IN')} · {item.actor}</li>)}</ul></details>)}</Card>
    <p className="mt-3 text-xs text-text-secondary">Parking register is a local demo. Guards receive view-only access through their gate workspace; no access card is issued.</p>
  </div>;
}
