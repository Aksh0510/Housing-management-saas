import type { User } from '../types/models';
import { attendanceService } from './attendanceService';
import { visitorService } from './visitorService';
import { incidentService } from './incidentService';

export interface ReportFilters { from: string; to: string }
function assertAdmin(user: User) {
  if (user.role !== 'admin' || !user.societyId) throw new Error('Reports are available to society admins only.');
}
function escapeCsv(value: string) { return `"${value.replace(/"/g, '""')}"`; }
export const reportService = {
  buildCsv(user: User, report: 'Attendance' | 'Visitors' | 'Incidents', filters: ReportFilters): string {
    assertAdmin(user);
    if (!filters.from || !filters.to || filters.from > filters.to) throw new Error('Select a valid report date range.');
    if (report === 'Attendance') {
      const rows = attendanceService.getForManager(user).filter((row) => row.date >= filters.from && row.date <= filters.to);
      return [['Staff', 'Date', 'Status', 'Check-in', 'Check-out'], ...rows.map((row) => [row.staffName, row.date, row.status, row.checkInAt ?? '', row.checkOutAt ?? ''])].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
    }
    if (report === 'Visitors') {
      const rows = visitorService.getForGate(user).filter((row) => (row.checkedInAt ?? row.expectedAt).slice(0, 10) >= filters.from && (row.checkedInAt ?? row.expectedAt).slice(0, 10) <= filters.to);
      return [['Visitor', 'Flat', 'Host', 'Purpose', 'Status', 'Entry'], ...rows.map((row) => [row.name, row.flat, row.residentName, row.purpose, row.status, row.checkedInAt ?? row.expectedAt])].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
    }
    const rows = incidentService.getVisible(user).filter((row) => row.createdAt.slice(0, 10) >= filters.from && row.createdAt.slice(0, 10) <= filters.to);
    return [['ID', 'Reporter', 'Type', 'Location', 'Created', 'Description'], ...rows.map((row) => [row.id, row.reporterName, row.type, row.location, row.createdAt, row.description])].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
  },
};
