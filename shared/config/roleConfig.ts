import type { User, UserRole } from '../types/models';

export const roleCapabilities: Record<UserRole, string[]> = {
  superadmin: ['platform.dashboard', 'societies.manage', 'audit.read'],
  admin: ['society.dashboard', 'members.read', 'billing.read', 'visitors.manage', 'staff.manage', 'incidents.read', 'amenities.manage', 'notices.manage', 'documents.manage', 'vendors.manage', 'parking.manage', 'reports.export', 'audit.read', 'settings.read'],
  member: ['member.dashboard', 'bills.read', 'complaints.manage', 'visitors.manage-own', 'amenities.request-own', 'notices.read-own-wing', 'documents.request-own', 'parking.request-own'],
  staff: ['staff.dashboard', 'tasks.manage-own', 'attendance.manage-own', 'incidents.create', 'visitors.gate'],
};

const navigationByRole: Record<UserRole, string[]> = {
  superadmin: ['Dashboard', 'Societies'],
  admin: ['Dashboard', 'Society Profile', 'Members', 'Accounting & Billing', 'Security & Entry', 'Staff', 'Attendance', 'Incidents', 'Complaints', 'Parking & Vehicles', 'Amenities', 'Notices & Polls', 'Documents & NOC', 'Vendors & AMC', 'Reports', 'Audit Log', 'Settings'],
  member: ['Dashboard', 'My Bills & Payments', 'Complaints', 'Visitors', 'Parking & Vehicles', 'Amenities', 'Notices & Polls', 'Documents & NOC'],
  staff: ['Dashboard', 'Tasks', 'Attendance & Shifts', 'My Profile', 'Incident Report'],
};

export function getNavigation(user: User): string[] {
  if (user.role === 'staff' && user.staffType === 'Security Guard') {
    return ['Gate Access', 'Attendance & Shifts', 'Incident Report', 'Parking & Vehicles', 'My Profile'];
  }
  return navigationByRole[user.role];
}

export function canAccessPage(user: User, page: string): boolean {
  return getNavigation(user).includes(page);
}
