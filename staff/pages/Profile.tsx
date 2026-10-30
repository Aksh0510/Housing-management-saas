import Card from '../../../shared/components/ui/Card';
import { PageTitle } from '../../../shared/components/ui/DashboardWidgets';
import useAuth from '../../../shared/hooks/useAuth';

export default function Profile() {
  const { user } = useAuth();
  const guard = user?.staffType === 'Security Guard';
  return <div className="mx-auto max-w-3xl">
    <PageTitle title="My profile" description="Personal work details visible only in your signed-in workspace." />
    <Card title={user?.name ?? 'Staff member'} description={user?.staffType ?? 'Society staff'}>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div><dt className="text-xs text-text-secondary">Contact</dt><dd className="mt-1 text-sm">{user?.mobile ?? 'Not provided'}</dd></div>
        <div><dt className="text-xs text-text-secondary">Email</dt><dd className="mt-1 break-all text-sm">{user?.email ?? 'Not provided'}</dd></div>
        <div><dt className="text-xs text-text-secondary">Assigned zone</dt><dd className="mt-1 text-sm">{user?.gate ?? (guard ? 'Main Gate' : 'Society office')}</dd></div>
        <div><dt className="text-xs text-text-secondary">Shift</dt><dd className="mt-1 text-sm">{guard ? '06:00–14:00' : '09:00–18:00'}</dd></div>
        <div><dt className="text-xs text-text-secondary">Emergency contact</dt><dd className="mt-1 text-sm">On file · ending ••42</dd></div>
        <div><dt className="text-xs text-text-secondary">Identity document</dt><dd className="mt-1 text-sm">Verified · ID ending ••19</dd></div>
      </dl>
    </Card>
  </div>;
}
