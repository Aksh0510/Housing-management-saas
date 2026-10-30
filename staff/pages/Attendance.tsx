import { useMemo, useState, useSyncExternalStore, type FormEvent } from 'react';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import Input from '../../../shared/components/ui/Input';
import { PageTitle } from '../../../shared/components/ui/DashboardWidgets';
import Table, { type TableColumn } from '../../../shared/components/ui/Table';
import useAuth from '../../../shared/hooks/useAuth';
import useToast from '../../../shared/hooks/useToast';
import { attendanceService, type AttendanceRecord, type AttendanceStatus } from '../../../shared/services/attendanceService';

export default function Attendance() {
  const { user } = useAuth();
  const { error, success } = useToast();
  const revision = useSyncExternalStore(attendanceService.subscribe, attendanceService.getRevision);
  const records = useMemo(() => user && user.role === 'staff' ? attendanceService.getMyAttendance(user) : [], [user, revision]);
  const today = new Date().toISOString().slice(0, 10);
  const shift = records.find((record) => record.date === today);
  const [correctionDate, setCorrectionDate] = useState(today);

  const perform = (action: 'checkIn' | 'checkOut') => {
    if (!user) return;
    try { attendanceService[action](user); success(action === 'checkIn' ? 'Shift check-in recorded.' : 'Shift check-out recorded.'); }
    catch (reason) { error(reason instanceof Error ? reason.message : 'Attendance could not be updated.'); }
  };

  const submitLeave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const data = new FormData(event.currentTarget);
    try {
      attendanceService.requestLeave(user, { from: String(data.get('from') ?? ''), to: String(data.get('to') ?? ''), reason: String(data.get('reason') ?? '') });
      event.currentTarget.reset();
      success('Leave request submitted for manager approval.');
    } catch (reason) { error(reason instanceof Error ? reason.message : 'Leave request could not be submitted.'); }
  };
  const submitCorrection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const data = new FormData(event.currentTarget);
    try {
      attendanceService.requestCorrection(user, { date: correctionDate, reason: String(data.get('reason') ?? '') });
      event.currentTarget.reset();
      success('Correction request flagged for manager approval.');
    } catch (reason) { error(reason instanceof Error ? reason.message : 'Correction request could not be submitted.'); }
  };

  const columns: TableColumn<AttendanceRecord>[] = [
    { key: 'date', header: 'Date', render: (row) => new Date(`${row.date}T00:00:00`).toLocaleDateString('en-IN') },
    { key: 'checkInAt', header: 'Check-in', render: (row) => row.checkInAt ? new Date(row.checkInAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—' },
    { key: 'checkOutAt', header: 'Check-out', render: (row) => row.checkOutAt ? new Date(row.checkOutAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—' },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'Present' ? 'success' : row.status === 'Late' ? 'warning' : 'neutral'}>{row.status}</Badge> },
  ];

  return <div className="mx-auto max-w-5xl">
    <PageTitle title="Attendance & shifts" description="Your shift record and requests are private to your staff account." />
    <Card title={`Today's shift · ${shift?.zone ?? user?.gate ?? 'Assigned zone'}`} description={`${shift?.shiftStart ?? '—'} to ${shift?.shiftEnd ?? '—'}`}>
      <p className="mb-4 text-sm">{shift?.checkInAt ? `Checked in ${new Date(shift.checkInAt).toLocaleTimeString('en-IN')}` : 'You have not checked in yet.'}{shift?.checkOutAt ? ` · Checked out ${new Date(shift.checkOutAt).toLocaleTimeString('en-IN')}` : ''}</p>
      <div className="flex flex-wrap gap-2"><Button onClick={() => perform('checkIn')} disabled={Boolean(shift?.checkInAt)}>Check in</Button><Button variant="outline" onClick={() => perform('checkOut')} disabled={!shift?.checkInAt || Boolean(shift?.checkOutAt)}>Check out</Button></div>
    </Card>
    <Card className="mt-4" title="Weekly attendance history" description="Only your personal attendance rows are shown."><Table columns={columns} data={records} rowKey="id" caption="My attendance history" emptyMessage="No attendance history yet." /></Card>
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <Card title="Request leave" description="Submit a date range and reason for manager review.">
        <form onSubmit={submitLeave} className="space-y-3"><Input name="from" label="From" type="date" required /><Input name="to" label="To" type="date" required /><Input name="reason" label="Reason" minLength={5} required /><Button type="submit">Submit leave request</Button></form>
      </Card>
      <Card title="Request attendance correction" description="Every correction is flagged for manager approval.">
        <form onSubmit={submitCorrection} className="space-y-3"><Input label="Date to correct" type="date" value={correctionDate} onChange={(event) => setCorrectionDate(event.target.value)} required /><Input name="reason" label="Correction reason" minLength={5} required /><Button type="submit" variant="outline">Submit correction</Button></form>
      </Card>
    </div>
  </div>;
}
