import { useMemo, useSyncExternalStore } from 'react';
import Badge from '../../../../shared/components/ui/Badge';
import Card from '../../../../shared/components/ui/Card';
import { PageTitle } from '../../../../shared/components/ui/DashboardWidgets';
import Table, { type TableColumn } from '../../../../shared/components/ui/Table';
import useAuth from '../../../../shared/hooks/useAuth';
import { attendanceService, type AttendanceRecord } from '../../../../shared/services/attendanceService';

export default function AttendanceReport() {
  const { user } = useAuth();
  const revision = useSyncExternalStore(attendanceService.subscribe, attendanceService.getRevision);
  const records = useMemo(() => user ? attendanceService.getForManager(user) : [], [user, revision]);
  const columns: TableColumn<AttendanceRecord>[] = [
    { key: 'staffName', header: 'Staff member' },
    { key: 'date', header: 'Date', render: (row) => new Date(`${row.date}T00:00:00`).toLocaleDateString('en-IN') },
    { key: 'zone', header: 'Zone / shift', render: (row) => <span>{row.zone}<span className="block text-xs text-text-secondary">{row.shiftStart}–{row.shiftEnd}</span></span> },
    { key: 'checkInAt', header: 'Check-in', render: (row) => row.checkInAt ? new Date(row.checkInAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—' },
    { key: 'checkOutAt', header: 'Check-out', render: (row) => row.checkOutAt ? new Date(row.checkOutAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—' },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'Present' ? 'success' : row.status === 'Late' ? 'warning' : 'neutral'}>{row.status}</Badge> },
  ];
  return <div><PageTitle title="Staff attendance" description="Society-wide attendance for managers and admins. Staff see only their own rows." /><Card title="Attendance history" description={`${records.length} records · last 7 days`}><Table columns={columns} data={records} rowKey="id" caption="Society staff attendance" /></Card></div>;
}
