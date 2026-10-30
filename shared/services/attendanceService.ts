import type { User } from '../types/models';

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Leave' | 'Half-day';

export interface AttendanceRecord {
  id: string;
  societyId: string;
  staffId: string;
  staffName: string;
  date: string;
  status: AttendanceStatus;
  checkInAt?: string;
  checkOutAt?: string;
  shiftStart: string;
  shiftEnd: string;
  zone: string;
}

export interface LeaveRequest {
  id: string;
  societyId: string;
  staffId: string;
  from: string;
  to: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface CorrectionRequest {
  id: string;
  societyId: string;
  staffId: string;
  date: string;
  reason: string;
  status: 'Pending approval';
}

const formatDateKeyLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const today = formatDateKeyLocal(new Date());
const staffSeed = [
  { staffId: 'ST001', staffName: 'Sunita Patil', status: 'Present' as const, shiftStart: '09:00', shiftEnd: '18:00', zone: 'Society office' },
  { staffId: 'ST002', staffName: 'Vikram Singh', status: 'Present' as const, shiftStart: '06:00', shiftEnd: '14:00', zone: 'Main Gate' },
  { staffId: 'ST003', staffName: 'Anil Kulkarni', status: 'Absent' as const, shiftStart: '10:00', shiftEnd: '17:00', zone: 'Management office' },
];
const seededStaff: AttendanceRecord[] = staffSeed.flatMap((staff) =>
  Array.from({ length: 7 }, (_, offset) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const dateKey = formatDateKeyLocal(date);
    return {
      id: `ATT-${staff.staffId}-${dateKey}`,
      societyId: 'SOC001',
      ...staff,
      date: dateKey,
      status: offset === 0 ? staff.status : offset === 2 ? 'Leave' as const : offset === 4 ? 'Half-day' as const : 'Present' as const,
      checkInAt: undefined,
    };
  }),
);

let attendance = seededStaff.map((record) => ({ ...record }));
let leaveRequests: LeaveRequest[] = [];
let correctionRequests: CorrectionRequest[] = [];
let sequence = 1;
let revision = 0;
const listeners = new Set<() => void>();

function assertStaff(user: User, roles: User['role'][] = ['staff']): string {
  const invalidStaffId = user.role === 'staff' && !user.id.startsWith('ST');
  if (!roles.includes(user.role) || !user.societyId || invalidStaffId) {
    throw new Error('You do not have permission to access staff attendance.');
  }
  return user.societyId;
}

function publish() {
  revision += 1;
  listeners.forEach((listener) => listener());
}

function currentRecord(user: User, societyId: string) {
  const record = attendance.find((item) => item.staffId === user.id && item.societyId === societyId && item.date === today);
  if (!record) throw new Error('No shift is configured for this staff member today.');
  return record;
}

export const attendanceService = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getRevision() {
    return revision;
  },
  reset() {
    attendance = seededStaff.map((record) => ({ ...record }));
    leaveRequests = [];
    correctionRequests = [];
    sequence = 1;
    publish();
  },
  getMyAttendance(user: User): AttendanceRecord[] {
    const societyId = assertStaff(user);
    return attendance.filter((record) => record.societyId === societyId && record.staffId === user.id).sort((a, b) => b.date.localeCompare(a.date)).map((record) => ({ ...record }));
  },
  getForManager(user: User): AttendanceRecord[] {
    const societyId = assertStaff(user, ['admin', 'staff']);
    if (user.role === 'staff' && user.staffType !== 'Manager' && user.staffType !== 'Chairman') {
      throw new Error('Only a manager or society admin can view team attendance.');
    }
    return attendance.filter((record) => record.societyId === societyId).map((record) => ({ ...record }));
  },
  checkIn(user: User): AttendanceRecord {
    const societyId = assertStaff(user);
    const record = currentRecord(user, societyId);
    if (record.checkInAt) throw new Error('You have already checked in for this shift.');
    record.checkInAt = new Date().toISOString();
    record.status = new Date().toTimeString().slice(0, 5) > record.shiftStart ? 'Late' : 'Present';
    publish();
    return { ...record };
  },
  checkOut(user: User): AttendanceRecord {
    const societyId = assertStaff(user);
    const record = currentRecord(user, societyId);
    if (!record.checkInAt) throw new Error('Check in before checking out.');
    if (record.checkOutAt) throw new Error('You have already checked out for this shift.');
    record.checkOutAt = new Date().toISOString();
    publish();
    return { ...record };
  },
  requestLeave(user: User, input: { from: string; to: string; reason: string }): LeaveRequest {
    const societyId = assertStaff(user);
    if (!input.from || !input.to || input.to < input.from || input.reason.trim().length < 5) {
      throw new Error('Enter a valid date range and a reason of at least 5 characters.');
    }
    const request = { id: `LEV-${String(sequence++).padStart(4, '0')}`, societyId, staffId: user.id, ...input, reason: input.reason.trim(), status: 'Pending' as const };
    leaveRequests = [request, ...leaveRequests];
    publish();
    return { ...request };
  },
  requestCorrection(user: User, input: { date: string; reason: string }): CorrectionRequest {
    const societyId = assertStaff(user);
    if (!input.date || input.reason.trim().length < 5) throw new Error('A date and correction reason of at least 5 characters are required.');
    const request = { id: `COR-${String(sequence++).padStart(4, '0')}`, societyId, staffId: user.id, date: input.date, reason: input.reason.trim(), status: 'Pending approval' as const };
    correctionRequests = [request, ...correctionRequests];
    publish();
    return { ...request };
  },
  getRequestsForManager(user: User) {
    const societyId = assertStaff(user, ['admin', 'staff']);
    if (user.role === 'staff' && user.staffType !== 'Manager' && user.staffType !== 'Chairman') {
      throw new Error('Only a manager or society admin can view staff requests.');
    }
    return {
      leave: leaveRequests.filter((request) => request.societyId === societyId).map((request) => ({ ...request })),
      corrections: correctionRequests.filter((request) => request.societyId === societyId).map((request) => ({ ...request })),
    };
  },
};
