import { useMemo, useSyncExternalStore } from 'react';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import { PageTitle, StatCard } from '../../../shared/components/ui/DashboardWidgets';
import useAuth from '../../../shared/hooks/useAuth';
import { attendanceService } from '../../../shared/services/attendanceService';
import { taskService } from '../../../shared/services/taskService';

interface StaffDashboardProps {
  onNavigate: (page: string) => void;
}

export default function StaffDashboard({ onNavigate }: StaffDashboardProps) {
  const { user } = useAuth();
  const taskRevision = useSyncExternalStore(taskService.subscribe, taskService.getRevision);
  const attendanceRevision = useSyncExternalStore(attendanceService.subscribe, attendanceService.getRevision);
  const tasks = useMemo(() => user && user.role === 'staff' ? taskService.getAssigned(user) : [], [user, taskRevision]);
  const records = useMemo(() => user && user.role === 'staff' ? attendanceService.getMyAttendance(user) : [], [user, attendanceRevision]);
  const shift = records.find((record) => record.date === new Date().toISOString().slice(0, 10));

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title={`Welcome, ${user?.name.split(' ')[0] ?? 'team member'}`} description="Your personal shift, assigned work and society updates." />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard label="Open tasks" value={String(tasks.filter((task) => task.status !== 'Verified').length)} detail="Assigned to you" tone="primary" />
        <StatCard label="Today's shift" value={shift ? `${shift.shiftStart}–${shift.shiftEnd}` : 'Not set'} detail={shift?.zone ?? 'Contact the manager'} tone="green" />
        <StatCard label="Attendance" value={shift?.checkInAt ? 'Checked in' : 'Not checked in'} detail={shift?.status ?? 'Today'} tone="amber" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="My work" description="Review assignments, due dates and completion history." className="h-full">
          <Button onClick={() => onNavigate('Tasks')}>Open tasks</Button>
          {tasks.slice(0, 2).map((task) => <p key={task.id} className="mt-3 text-sm">{task.title}<span className="block text-xs text-text-secondary">{task.status} · Due {new Date(task.dueAt).toLocaleDateString('en-IN')}</span></p>)}
        </Card>
        <Card title="Shift & attendance" description="Record your attendance and send requests to your manager." className="h-full">
          <Button variant="outline" onClick={() => onNavigate('Attendance & Shifts')}>Open attendance</Button>
          <p className="mt-3 text-sm">{shift?.zone ?? 'Assigned area'} · {shift?.shiftStart ?? '—'} to {shift?.shiftEnd ?? '—'}</p>
        </Card>
      </div>
      <div className="mt-4"><Button variant="ghost" onClick={() => onNavigate('My Profile')}>View my profile</Button></div>
      <p className="mt-4 text-xs text-text-secondary">Demo workspace · task and attendance actions are local mock records.</p>
    </div>
  );
}
