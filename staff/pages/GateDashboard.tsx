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

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

interface GateDashboardProps {
  onIncident: () => void;
}

export default function GateDashboard({ onIncident }: GateDashboardProps) {
  const { user } = useAuth();
  const { success, error } = useToast();
  const revision = useSyncExternalStore(visitorService.subscribe, visitorService.getRevision);
  const visitors = useMemo(() => user ? visitorService.getForGate(user) : [], [user, revision]);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showDelivery, setShowDelivery] = useState(false);
  const [checkOutTarget, setCheckOutTarget] = useState<SocietyVisitor | null>(null);
  const [checkInTarget, setCheckInTarget] = useState<SocietyVisitor | null>(null);
  const [filter, setFilter] = useState('All activity');
  const [lookup, setLookup] = useState('');
  const inside = visitors.filter((visitor) => visitor.status === 'Inside');
  const expected = visitors.filter((visitor) => visitor.status === 'Pre-approved');
  const deliveries = visitors.filter((visitor) => visitor.status === 'Delivery logged');
  const visibleVisitors = visitors.filter((visitor) =>
    (filter === 'All activity' || visitor.status === filter) &&
    `${visitor.name} ${visitor.phone} ${visitor.flat} ${visitor.residentName}`.toLocaleLowerCase('en-IN').includes(lookup.toLocaleLowerCase('en-IN')),
  );

  const checkIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const data = new FormData(event.currentTarget);
    try {
      const visitor = visitorService.registerAtGate(user, {
        name: String(data.get('name') ?? ''),
        phone: String(data.get('phone') ?? ''),
        flat: String(data.get('flat') ?? ''),
        purpose: String(data.get('purpose') ?? ''),
      });
      event.currentTarget.reset();
      setShowCheckIn(false);
      success(visitor.status === 'Inside'
        ? `${visitor.name} checked in at ${visitor.flat}. Resident history is updated.`
        : `${visitor.name} is pending host confirmation at ${visitor.flat}; entry is not approved yet.`);
    } catch (reason) {
      error(reason instanceof Error ? reason.message : 'The visitor could not be checked in.');
    }
  };

  const confirmCheckIn = () => {
    if (!user || !checkInTarget) return;
    try {
      visitorService.checkIn(user, checkInTarget.id);
      success(`${checkInTarget.name} checked in at ${checkInTarget.flat}.`);
      setCheckInTarget(null);
    } catch (reason) {
      error(reason instanceof Error ? reason.message : 'The visitor could not be checked in.');
    }
  };

  const checkOut = () => {
    if (!user || !checkOutTarget) return;
    try {
      visitorService.checkOut(user, checkOutTarget.id);
      success(`${checkOutTarget.name} checked out. Resident history is updated.`);
      setCheckOutTarget(null);
    } catch (reason) {
      error(reason instanceof Error ? reason.message : 'The visitor could not be checked out.');
    }
  };

  const logDelivery = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const data = new FormData(event.currentTarget);
    try {
      const delivery = visitorService.logDelivery(user, {
        name: String(data.get('delivery-name') ?? ''),
        flat: String(data.get('delivery-flat') ?? ''),
        reference: String(data.get('delivery-reference') ?? ''),
      });
      event.currentTarget.reset();
      setShowDelivery(false);
      success(`Delivery logged for ${delivery.flat}. The resident can see it in their gate history.`);
    } catch (reason) {
      error(reason instanceof Error ? reason.message : 'The delivery could not be logged.');
    }
  };

  const columns: TableColumn<SocietyVisitor>[] = [
    { key: 'name', header: 'Visitor / delivery', render: (row) => <span className="font-semibold">{row.name}<span className="block text-xs font-normal text-text-secondary">{row.phone || row.reference || row.purpose}</span></span> },
    { key: 'flat', header: 'Flat / host', render: (row) => <span>{row.flat}<span className="block text-xs text-text-secondary">{row.residentName}</span></span> },
    { key: 'expectedAt', header: 'Time', render: (row) => formatTime(row.checkedInAt ?? row.expectedAt) },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'Inside' ? 'success' : row.status === 'Pre-approved' ? 'info' : row.status === 'Pending host approval' ? 'warning' : row.status === 'Rejected' ? 'danger' : 'neutral'}>{row.status}</Badge> },
    { key: 'id', header: 'Gate action', render: (row) => row.status === 'Inside'
      ? <Button size="sm" variant="outline" onClick={() => setCheckOutTarget(row)}>Check out</Button>
      : row.status === 'Pre-approved'
        ? <Button size="sm" onClick={() => setCheckInTarget(row)}>Check in</Button>
        : <span className="text-xs text-text-secondary">{row.status === 'Delivery logged' ? 'Delivery noted' : 'Closed'}</span> },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title="Gate dashboard" description={`${user?.gate ?? 'Main Gate'} · ${user?.staffType ?? 'Security'} · Society visitor activity.`} />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard label="Inside now" value={String(inside.length)} detail="Check out guests as they leave" tone="green" />
        <StatCard label="Expected visitors" value={String(expected.length)} detail="Pre-approved by residents" tone="primary" />
        <StatCard label="Deliveries logged" value={String(deliveries.length)} detail="Visible to the host flat" tone="amber" />
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Button size="lg" className="min-h-16 justify-start text-base" onClick={() => setShowCheckIn(true)}>＋ Check-in visitor</Button>
        <Button size="lg" variant="outline" className="min-h-16 justify-start text-base" onClick={() => inside[0] ? setCheckOutTarget(inside[0]) : error('There are no visitors inside to check out.')}>↗ Check-out visitor</Button>
        <Button size="lg" variant="secondary" className="min-h-16 justify-start text-base" onClick={() => setShowDelivery(true)}>▣ Log delivery</Button>
      </div>
      <Card title="Gate activity" description="Pre-approvals, active visitors and recent delivery logs.">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <label className="text-sm">Lookup approved visitor<input aria-label="Lookup visitor by name, phone or flat" value={lookup} onChange={(event) => setLookup(event.target.value)} placeholder="Name, phone or flat" className="ml-2 min-h-9 rounded-md border border-border px-2" /></label>
          <label className="flex items-center gap-2 text-sm font-medium">Show
            <select className="min-h-9 rounded-md border border-border bg-white px-2" value={filter} onChange={(event) => setFilter(event.target.value)}>
              {['All activity', 'Inside', 'Pre-approved', 'Pending host approval', 'Checked out', 'Delivery logged', 'Rejected'].map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
        </div>
        <Table columns={columns} data={visibleVisitors} rowKey="id" caption="Society gate activity" />
        {visibleVisitors.length === 0 && <p className="p-5 text-sm text-text-secondary">No gate records match this filter.</p>}
      </Card>
      <div className="mt-4"><Button variant="ghost" onClick={onIncident}>Log an incident</Button></div>
      <p className="mt-2 text-xs text-text-secondary">Demo gate records are in-memory only. Visitor actions update resident history; no SMS or push notification is sent.</p>

      <Modal isOpen={showCheckIn} onClose={() => setShowCheckIn(false)} title="Check in visitor" description="A matching resident pre-approval is linked automatically when the flat and phone match." footer={<><Button variant="outline" onClick={() => setShowCheckIn(false)}>Cancel</Button><Button type="submit" form="visitor-check-in">Save check-in</Button></>}>
        <form id="visitor-check-in" onSubmit={checkIn} className="grid gap-4 sm:grid-cols-2">
          <Input name="name" label="Visitor name" required autoFocus />
          <Input name="phone" label="Phone number" type="tel" inputMode="tel" pattern="\+?[0-9\s\-]{10,16}" required />
          <Input name="flat" label="Flat number" placeholder="e.g. A-1204" required />
          <Input name="vehicle" label="Vehicle (optional)" placeholder="MH 01 AB 1234" />
          <label className="space-y-1.5 text-sm font-medium">Purpose
            <select name="purpose" className="min-h-10 w-full rounded-md border border-border bg-white px-3"><option>Guest</option><option>Delivery</option><option>Service visit</option><option>Other</option></select>
          </label>
        </form>
      </Modal>
      <Modal isOpen={showDelivery} onClose={() => setShowDelivery(false)} title="Log delivery" description="Record a parcel and make it visible in the recipient flat's history." footer={<><Button variant="outline" onClick={() => setShowDelivery(false)}>Cancel</Button><Button type="submit" form="delivery-form">Save delivery</Button></>}>
        <form id="delivery-form" onSubmit={logDelivery} className="grid gap-4">
          <Input name="delivery-name" label="Courier / sender" required autoFocus />
          <Input name="delivery-flat" label="Flat number" placeholder="e.g. A-1204" required />
          <Input name="delivery-reference" label="Tracking reference (optional)" />
        </form>
      </Modal>
      <Modal isOpen={checkInTarget !== null} onClose={() => setCheckInTarget(null)} title="Confirm visitor check-in" description="This will update the resident's visitor history." footer={<><Button variant="outline" onClick={() => setCheckInTarget(null)}>Cancel</Button><Button onClick={confirmCheckIn}>Confirm check-in</Button></>}>
        {checkInTarget && <p className="rounded-lg bg-surface-light p-4 text-sm"><strong>{checkInTarget.name}</strong> · {checkInTarget.flat}<span className="block text-xs text-text-secondary">{checkInTarget.purpose} · host {checkInTarget.residentName}</span></p>}
      </Modal>
      <Modal isOpen={checkOutTarget !== null} onClose={() => setCheckOutTarget(null)} title="Confirm visitor check-out" description="Confirm that this visitor is leaving the society." footer={<><Button variant="outline" onClick={() => setCheckOutTarget(null)}>Cancel</Button><Button onClick={checkOut}>Confirm check-out</Button></>}>
        {checkOutTarget && <p className="rounded-lg bg-surface-light p-4 text-sm"><strong>{checkOutTarget.name}</strong> · {checkOutTarget.flat}<span className="block text-xs text-text-secondary">{checkOutTarget.phone} · host {checkOutTarget.residentName}</span></p>}
      </Modal>
    </div>
  );
}
