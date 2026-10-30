import { useMemo, useState, type FormEvent } from 'react';
import Badge from '../../shared/components/ui/Badge';
import Button from '../../shared/components/ui/Button';
import Card from '../../shared/components/ui/Card';
import Input from '../../shared/components/ui/Input';
import { PageTitle } from '../../shared/components/ui/DashboardWidgets';
import Table, { type TableColumn } from '../../shared/components/ui/Table';
import useAuth from '../../shared/hooks/useAuth';
import useToast from '../../shared/hooks/useToast';
import { amenityService, type AmenityBooking } from '../../shared/services/amenityService';

export default function Amenities() {
  const { user } = useAuth();
  const { error, success } = useToast();
  const [revision, setRevision] = useState(0);
  const [reason, setReason] = useState<Record<string, string>>({});
  const records = useMemo(() => user ? amenityService.getForUser(user) : [], [user, revision]);
  const refresh = () => setRevision((value) => value + 1);
  const request = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const data = new FormData(event.currentTarget);
    try { amenityService.request(user, { amenity: String(data.get('amenity') ?? ''), date: String(data.get('date') ?? ''), start: String(data.get('start') ?? ''), end: String(data.get('end') ?? '') }); event.currentTarget.reset(); refresh(); success('Booking request sent to the society office.'); }
    catch (reasonValue) { error(reasonValue instanceof Error ? reasonValue.message : 'Booking request failed.'); }
  };
  const decide = (row: AmenityBooking, decision: 'Approved' | 'Rejected') => {
    if (!user) return;
    try { amenityService.decide(user, row.id, decision, reason[row.id] ?? (decision === 'Approved' ? 'Approved by society office' : 'Slot unavailable')); refresh(); success(`Amenity request ${decision.toLowerCase()}.`); }
    catch (reasonValue) { error(reasonValue instanceof Error ? reasonValue.message : 'Decision failed.'); }
  };
  const cancel = (row: AmenityBooking) => {
    if (!user) return;
    try { amenityService.cancel(user, row.id); refresh(); success('Booking cancelled.'); }
    catch (reasonValue) { error(reasonValue instanceof Error ? reasonValue.message : 'Booking could not be cancelled.'); }
  };
  const columns: TableColumn<AmenityBooking>[] = [
    { key: 'amenity', header: 'Amenity', render: (row) => <span>{row.amenity}<span className="block text-xs text-text-secondary">{row.residentName} · {row.flat}</span></span> },
    { key: 'date', header: 'Slot', render: (row) => `${new Date(`${row.date}T00:00:00`).toLocaleDateString('en-IN')} · ${row.start}–${row.end}` },
    { key: 'charge', header: 'Charge', render: (row) => `₹${row.charge.toLocaleString('en-IN')}` },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'Approved' ? 'success' : row.status === 'Pending' ? 'warning' : 'neutral'}>{row.status}</Badge> },
    { key: 'id', header: 'Action', render: (row) => user?.role === 'admin' && row.status === 'Pending' ? <div className="flex flex-wrap gap-2"><Input aria-label={`Decision reason for ${row.id}`} value={reason[row.id] ?? ''} onChange={(event) => setReason((current) => ({ ...current, [row.id]: event.target.value }))} placeholder="Decision note" /><Button size="sm" onClick={() => decide(row, 'Approved')}>Approve</Button><Button size="sm" variant="outline" onClick={() => decide(row, 'Rejected')}>Reject</Button></div> : user?.role === 'member' && ['Pending', 'Approved'].includes(row.status) ? <Button size="sm" variant="outline" onClick={() => cancel(row)}>Cancel</Button> : row.decisionReason ?? '—' },
  ];
  return <div><PageTitle title="Amenities booking" description={user?.role === 'admin' ? 'Review requests and prevent overlapping confirmed bookings.' : 'Request a community amenity slot and track its confirmation.'} />
    {user?.role === 'member' && <Card className="mb-4" title="Available amenities" description="Charges shown per booking."><div className="mb-3 flex flex-wrap gap-3 text-sm">{amenityService.getConfig().map((item) => <span key={item.name} className="rounded border border-border p-2">{item.name} · ₹{item.charge.toLocaleString('en-IN')} · {item.open}–{item.close}</span>)}</div>
      <form onSubmit={request} className="grid gap-3 sm:grid-cols-5"><label className="space-y-1.5 text-sm font-medium sm:col-span-2">Amenity<select name="amenity" className="min-h-10 w-full rounded-md border border-border bg-white px-3">{amenityService.getConfig().map((item) => <option key={item.name}>{item.name}</option>)}</select></label><Input name="date" label="Date" type="date" min={new Date().toISOString().slice(0, 10)} required /><Input name="start" label="Start time" type="time" required /><Input name="end" label="End time" type="time" required /><div className="sm:col-span-5"><Button type="submit">Request booking</Button></div></form>
    </Card>}
    <Card title={user?.role === 'admin' ? 'Booking approval queue' : 'My bookings'}><Table columns={columns} data={records} rowKey="id" caption="Amenity bookings" emptyMessage="No booking requests yet." /></Card>
  </div>;
}
