import { mockMembers } from '../data/mockMembers';
import type { User } from '../types/models';

export type VisitorStatus = 'Pre-approved' | 'Pending host approval' | 'Inside' | 'Checked out' | 'Delivery logged' | 'Rejected';

export interface SocietyVisitor {
  id: string;
  societyId: string;
  residentId: string;
  residentName: string;
  flat: string;
  name: string;
  phone: string;
  purpose: string;
  expectedAt: string;
  status: VisitorStatus;
  checkedInAt?: string;
  checkedOutAt?: string;
  gate?: string;
  reference?: string;
  vehicle?: string;
}

interface VisitorInput {
  name: string;
  phone: string;
  date: string;
  time: string;
  purpose: string;
}

const initialVisitors: SocietyVisitor[] = [
  { id: 'VIS-901', societyId: 'SOC001', residentId: 'MB002', residentName: 'Rohit Sharma', flat: 'B-504', name: 'Arjun Nair', phone: '9876500001', purpose: 'Family visit', expectedAt: '2026-10-29T10:24', status: 'Inside', checkedInAt: '2026-10-29T10:24' },
  { id: 'VIS-902', societyId: 'SOC001', residentId: 'MB003', residentName: 'Meera Iyer', flat: 'C-301', name: 'Mehul Joshi', phone: '9876500002', purpose: 'Food delivery', expectedAt: '2026-10-29T10:18', status: 'Inside', checkedInAt: '2026-10-29T10:18' },
  { id: 'PRE-903', societyId: 'SOC001', residentId: 'MB001', residentName: 'Anjali Mehta', flat: 'A-1204', name: 'Riya Kapoor', phone: '9888810001', purpose: 'Guest', expectedAt: '2026-10-29T11:30', status: 'Pre-approved' },
  { id: 'PRE-904', societyId: 'SOC001', residentId: 'MB001', residentName: 'Anjali Mehta', flat: 'A-1204', name: 'AquaCare Services', phone: '9888810002', purpose: 'Service visit', expectedAt: '2026-10-29T12:00', status: 'Pre-approved' },
];

let visitors = initialVisitors.map((visitor) => ({ ...visitor }));
let nextVisitorId = 905;
let revision = 0;
const listeners = new Set<() => void>();

function assertRole(user: User, roles: User['role'][]): string {
  if (!roles.includes(user.role) || !user.societyId) {
    throw new Error('You do not have permission to access society gate records.');
  }
  return user.societyId;
}

function assertGateRole(user: User): string {
  const societyId = assertRole(user, ['admin', 'staff']);
  if (user.role === 'staff' && user.staffType !== 'Security Guard') {
    throw new Error('Gate records are available only to security staff.');
  }
  return societyId;
}

function memberForFlat(societyId: string, flat: string) {
  const normalized = flat.trim().toUpperCase();
  return mockMembers.find((member) => member.societyId === societyId && `${member.wing}-${member.unitNo}`.toUpperCase() === normalized);
}

function publish() {
  revision += 1;
  listeners.forEach((listener) => listener());
}

function nextId(prefix: string) {
  const id = `${prefix}-${nextVisitorId}`;
  nextVisitorId += 1;
  return id;
}

export const visitorService = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getRevision() {
    return revision;
  },
  reset() {
    visitors = initialVisitors.map((visitor) => ({ ...visitor }));
    nextVisitorId = 905;
    publish();
  },
  getForResident(user: User): SocietyVisitor[] {
    const societyId = assertRole(user, ['member']);
    return visitors
      .filter((visitor) => visitor.societyId === societyId && visitor.residentId === user.id)
      .map((visitor) => ({ ...visitor }));
  },
  getForGate(user: User): SocietyVisitor[] {
    const societyId = assertGateRole(user);
    return visitors.filter((visitor) => visitor.societyId === societyId).map((visitor) => ({ ...visitor }));
  },
  preApprove(user: User, input: VisitorInput): SocietyVisitor {
    const societyId = assertRole(user, ['member']);
    if (!input.name.trim() || !/^\+?[0-9\s-]{10,16}$/.test(input.phone.trim()) || !input.date || !input.time || !input.purpose.trim()) {
      throw new Error('Enter a visitor name, valid phone number, date, time and purpose.');
    }
    const member = mockMembers.find((item) => item.id === user.id && item.societyId === societyId);
    if (!member) throw new Error('Your flat could not be verified for visitor pre-approval.');
    const visitor: SocietyVisitor = {
      id: nextId('PRE'),
      societyId,
      residentId: user.id,
      residentName: user.name,
      flat: `${member.wing}-${member.unitNo}`,
      name: input.name.trim(),
      phone: input.phone.trim(),
      purpose: input.purpose.trim(),
      expectedAt: `${input.date}T${input.time}`,
      status: 'Pre-approved',
    };
    visitors = [visitor, ...visitors];
    publish();
    return { ...visitor };
  },
  checkIn(user: User, visitorId: string): SocietyVisitor {
    const societyId = assertGateRole(user);
    const visitor = visitors.find((item) => item.id === visitorId && item.societyId === societyId);
    if (!visitor) throw new Error('The visitor record was not found in this society.');
    if (visitor.status !== 'Pre-approved') throw new Error('Only a pre-approved visitor can be checked in from this action.');
    visitor.status = 'Inside';
    visitor.checkedInAt = new Date().toISOString();
    visitor.gate = user.gate ?? 'Main Gate';
    publish();
    return { ...visitor };
  },
  registerAtGate(user: User, input: { name: string; phone: string; flat: string; purpose: string; vehicle?: string }): SocietyVisitor {
    const societyId = assertGateRole(user);
    const member = memberForFlat(societyId, input.flat);
    if (!member) throw new Error('Enter a valid flat in this society.');
    if (!input.name.trim() || !/^\+?[0-9\s-]{10,16}$/.test(input.phone.trim()) || !input.purpose.trim()) {
      throw new Error('Enter a visitor name, valid phone number and purpose.');
    }
    const normalizedPhone = input.phone.replace(/\D/g, '');
    const approved = visitors.find((visitor) =>
      visitor.societyId === societyId &&
      visitor.flat.toUpperCase() === `${member.wing}-${member.unitNo}`.toUpperCase() &&
      visitor.phone.replace(/\D/g, '') === normalizedPhone &&
      visitor.status === 'Pre-approved',
    );
    if (approved) {
      approved.status = 'Inside';
      approved.checkedInAt = new Date().toISOString();
      approved.gate = user.gate ?? 'Main Gate';
      publish();
      return { ...approved };
    }
    const activeDuplicate = visitors.find((visitor) =>
      visitor.societyId === societyId &&
      visitor.phone.replace(/\D/g, '') === normalizedPhone &&
      visitor.status === 'Inside',
    );
    if (activeDuplicate) throw new Error(`${activeDuplicate.name} is already checked in at ${activeDuplicate.flat}.`);
    const visitor: SocietyVisitor = {
      id: nextId('VIS'),
      societyId,
      residentId: member.id,
      residentName: member.name,
      flat: `${member.wing}-${member.unitNo}`,
      name: input.name.trim(),
      phone: input.phone.trim(),
      purpose: input.purpose.trim(),
      expectedAt: new Date().toISOString(),
      status: 'Pending host approval',
      vehicle: input.vehicle?.trim() || undefined,
    };
    visitors = [visitor, ...visitors];
    publish();
    return { ...visitor };
  },
  approvePending(user: User, visitorId: string): SocietyVisitor {
    const societyId = assertRole(user, ['member', 'admin']);
    const visitor = visitors.find((item) => item.id === visitorId && item.societyId === societyId);
    if (!visitor || visitor.status !== 'Pending host approval') throw new Error('Pending visitor request was not found.');
    if (user.role === 'member' && visitor.residentId !== user.id) throw new Error('You can only approve visitors for your own flat.');
    visitor.status = 'Pre-approved';
    publish();
    return { ...visitor };
  },
  rejectPending(user: User, visitorId: string): SocietyVisitor {
    const societyId = assertRole(user, ['member', 'admin']);
    const visitor = visitors.find((item) => item.id === visitorId && item.societyId === societyId);
    if (!visitor || visitor.status !== 'Pending host approval') throw new Error('Pending visitor request was not found.');
    if (user.role === 'member' && visitor.residentId !== user.id) throw new Error('You can only reject visitors for your own flat.');
    visitor.status = 'Rejected';
    publish();
    return { ...visitor };
  },
  checkOut(user: User, visitorId: string): SocietyVisitor {
    const societyId = assertGateRole(user);
    const visitor = visitors.find((item) => item.id === visitorId && item.societyId === societyId);
    if (!visitor) throw new Error('The visitor record was not found in this society.');
    if (visitor.status !== 'Inside') throw new Error('This visitor is not currently inside the society.');
    visitor.status = 'Checked out';
    visitor.checkedOutAt = new Date().toISOString();
    publish();
    return { ...visitor };
  },
  logDelivery(user: User, input: { name: string; flat: string; reference?: string }): SocietyVisitor {
    const societyId = assertGateRole(user);
    const member = memberForFlat(societyId, input.flat);
    if (!member) throw new Error('Enter a valid flat in this society.');
    if (!input.name.trim()) throw new Error('Enter a courier or sender name.');
    const delivery: SocietyVisitor = {
      id: nextId('DLV'),
      societyId,
      residentId: member.id,
      residentName: member.name,
      flat: `${member.wing}-${member.unitNo}`,
      name: input.name.trim(),
      phone: '',
      purpose: 'Delivery',
      expectedAt: new Date().toISOString(),
      status: 'Delivery logged',
      reference: input.reference?.trim() || undefined,
    };
    visitors = [delivery, ...visitors];
    publish();
    return { ...delivery };
  },
};
