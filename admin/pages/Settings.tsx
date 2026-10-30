import Card from '../../../shared/components/ui/Card';
import { PageTitle } from '../../../shared/components/ui/DashboardWidgets';
import Table, { type TableColumn } from '../../../shared/components/ui/Table';
import { roleCapabilities } from '../../../shared/config/roleConfig';
import type { UserRole } from '../../../shared/types/models';

const roleNames: Record<UserRole, string> = { superadmin: 'Super Admin', admin: 'Society Admin', member: 'Resident', staff: 'Staff / Guard' };
const capabilityLabels: Record<string, string> = {
  'platform.dashboard': 'Platform dashboard', 'societies.manage': 'Manage societies',
  'society.dashboard': 'Society dashboard', 'members.read': 'Read members', 'billing.read': 'Read billing',
  'visitors.manage': 'Manage visitor entry', 'staff.manage': 'Manage staff', 'incidents.read': 'Read incidents',
  'amenities.manage': 'Manage amenities', 'notices.manage': 'Manage notices & polls', 'documents.manage': 'Review documents & NOC',
  'vendors.manage': 'Manage vendor contracts', 'parking.manage': 'Manage parking', 'reports.export': 'Export reports',
  'settings.read': 'Read role matrix', 'member.dashboard': 'Resident dashboard', 'bills.read': 'Read own bills',
  'complaints.manage': 'Manage own complaints', 'visitors.manage-own': 'Manage own visitors', 'amenities.request-own': 'Request own amenity slots',
  'notices.read-own-wing': 'Read wing notices & vote', 'documents.request-own': 'Request own NOC', 'parking.request-own': 'Request parking',
  'staff.dashboard': 'Staff dashboard', 'tasks.manage-own': 'Update assigned tasks', 'attendance.manage-own': 'Manage own attendance',
  'incidents.create': 'Submit incident reports', 'visitors.gate': 'Gate entry actions',
};
interface PermissionRow { capability: string; superadmin: string; admin: string; member: string; staff: string }

export default function Settings() {
  const rows: PermissionRow[] = Object.keys(capabilityLabels).map((capability) => {
    const has = (role: UserRole) => roleCapabilities[role].includes(capability) ? 'Allowed' : '—';
    return { capability: capabilityLabels[capability], superadmin: has('superadmin'), admin: has('admin'), member: has('member'), staff: has('staff') };
  });
  const columns: TableColumn<PermissionRow>[] = [
    { key: 'capability', header: 'Capability' },
    { key: 'superadmin', header: roleNames.superadmin },
    { key: 'admin', header: roleNames.admin },
    { key: 'member', header: roleNames.member },
    { key: 'staff', header: roleNames.staff },
  ];
  return <div><PageTitle title="Settings · role permissions" description="Display-only permission matrix generated from the same role configuration used for navigation." /><Card title="Permission matrix"><Table columns={columns} data={rows} rowKey="capability" caption="Role permission matrix" /></Card><p className="mt-3 text-xs text-text-secondary">Service boundaries additionally enforce access; this matrix is informational, not the sole security check.</p></div>;
}
