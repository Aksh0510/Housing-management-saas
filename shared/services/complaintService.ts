import { mockMembers } from '../data/mockMembers';
import type { User } from '../types/models';

export type ComplaintStatus = 'Open' | 'In progress' | 'Resolved' | 'Closed';
export type ComplaintPriority = 'Low' | 'Normal' | 'High';

export function isComplaintStatus(value: string): value is ComplaintStatus {
  return value === 'Open' || value === 'In progress' || value === 'Resolved' || value === 'Closed';
}

export function isComplaintPriority(value: string): value is ComplaintPriority {
  return value === 'Low' || value === 'Normal' || value === 'High';
}

export interface ComplaintEvent {
  id: string;
  status: ComplaintStatus;
  note: string;
  actor: string;
  createdAt: string;
}

export interface SocietyComplaint {
  id: string;
  societyId: string;
  memberId: string;
  resident: string;
  flat: string;
  subject: string;
  category: string;
  priority: ComplaintPriority;
  description: string;
  status: ComplaintStatus;
  assignedTo?: string;
  createdAt: string;
  slaDueAt: string;
  events: ComplaintEvent[];
}

const initialComplaints: SocietyComplaint[] = [
  { id: 'CMP-2401', societyId: 'SOC001', memberId: 'MB002', resident: 'Rohit Sharma', flat: 'B-504', subject: 'Water leakage in bathroom', category: 'Plumbing', priority: 'High', description: 'Water is seeping near the bathroom pipe joint.', status: 'In progress', assignedTo: 'Sunita Patil · Manager', createdAt: '2026-10-24T09:10:00', slaDueAt: '2026-10-29T18:00:00', events: [{ id: 'EV-CMP-2401-1', status: 'Open', note: 'Request submitted by resident.', actor: 'Rohit Sharma', createdAt: '2026-10-24T09:10:00' }, { id: 'EV-CMP-2401-2', status: 'In progress', note: 'Assigned for inspection.', actor: 'Society office', createdAt: '2026-10-24T12:15:00' }] },
  { id: 'CMP-2402', societyId: 'SOC001', memberId: 'MB003', resident: 'Meera Iyer', flat: 'C-301', subject: 'Lift making unusual noise', category: 'Elevator', priority: 'High', description: 'Unusual sound during operation; please inspect.', status: 'Open', createdAt: '2026-10-25T10:20:00', slaDueAt: '2026-10-27T18:00:00', events: [{ id: 'EV-CMP-2402-1', status: 'Open', note: 'Request submitted by resident.', actor: 'Meera Iyer', createdAt: '2026-10-25T10:20:00' }] },
  { id: 'CMP-2403', societyId: 'SOC001', memberId: 'MB001', resident: 'Anjali Mehta', flat: 'A-1204', subject: 'Corridor light not working', category: 'Electrical', priority: 'Normal', description: 'The corridor light outside the flat is not working.', status: 'Open', createdAt: '2026-10-26T14:05:00', slaDueAt: '2026-10-30T18:00:00', events: [{ id: 'EV-CMP-2403-1', status: 'Open', note: 'Request submitted by resident.', actor: 'Anjali Mehta', createdAt: '2026-10-26T14:05:00' }] },
  { id: 'CMP-2404', societyId: 'SOC001', memberId: 'MB004', resident: 'Karan Shah', flat: 'A-802', subject: 'Request for parking tag', category: 'Parking', priority: 'Low', description: 'Requesting a replacement parking tag.', status: 'Resolved', assignedTo: 'Society office', createdAt: '2026-10-20T08:30:00', slaDueAt: '2026-10-25T18:00:00', events: [{ id: 'EV-CMP-2404-1', status: 'Open', note: 'Request submitted by resident.', actor: 'Karan Shah', createdAt: '2026-10-20T08:30:00' }, { id: 'EV-CMP-2404-2', status: 'Resolved', note: 'Replacement tag issued.', actor: 'Society office', createdAt: '2026-10-22T11:40:00' }] },
];

let complaints = initialComplaints.map((complaint) => ({ ...complaint, events: complaint.events.map((event) => ({ ...event })) }));
let nextComplaintNumber = 2405;
let revision = 0;
const listeners = new Set<() => void>();

function assertScope(user: User, roles: User['role'][]): string {
  if (!roles.includes(user.role) || !user.societyId) throw new Error('You do not have permission to access these complaint records.');
  return user.societyId;
}

function copyComplaint(complaint: SocietyComplaint): SocietyComplaint {
  return { ...complaint, events: complaint.events.map((event) => ({ ...event })) };
}

function publish() {
  revision += 1;
  listeners.forEach((listener) => listener());
}

export const complaintService = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getRevision() {
    return revision;
  },
  reset() {
    complaints = initialComplaints.map(copyComplaint);
    nextComplaintNumber = 2405;
    publish();
  },
  getForUser(user: User): SocietyComplaint[] {
    const societyId = assertScope(user, ['admin', 'member']);
    return complaints
      .filter((complaint) => complaint.societyId === societyId && (user.role === 'admin' || complaint.memberId === user.id))
      .map(copyComplaint);
  },
  create(user: User, input: { subject: string; category: string; priority: ComplaintPriority; description: string }): SocietyComplaint {
    const societyId = assertScope(user, ['member']);
    const member = mockMembers.find((item) => item.id === user.id && item.societyId === societyId);
    if (!member) throw new Error('Your flat could not be verified for this request.');
    if (input.subject.trim().length < 5 || input.description.trim().length < 10) {
      throw new Error('Add an issue summary of at least 5 characters and details of at least 10 characters.');
    }
    const createdAt = new Date().toISOString();
    const id = `CMP-${nextComplaintNumber}`;
    nextComplaintNumber += 1;
    const complaint: SocietyComplaint = {
      id,
      societyId,
      memberId: user.id,
      resident: user.name,
      flat: `${member.wing}-${member.unitNo}`,
      subject: input.subject.trim(),
      category: input.category,
      priority: input.priority,
      description: input.description.trim(),
      status: 'Open',
      createdAt,
      slaDueAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      events: [{ id: `${id}-EV-1`, status: 'Open', note: 'Request submitted by resident.', actor: user.name, createdAt }],
    };
    complaints = [complaint, ...complaints];
    publish();
    return copyComplaint(complaint);
  },
  update(user: User, complaintId: string, input: { status: ComplaintStatus; assignedTo: string; note: string }): SocietyComplaint {
    const societyId = assertScope(user, ['admin']);
    const complaint = complaints.find((item) => item.id === complaintId && item.societyId === societyId);
    if (!complaint) throw new Error('The complaint was not found in this society.');
    if (!input.note.trim()) throw new Error('Add a short update note to preserve the activity history.');
    const allowedTransitions: Record<ComplaintStatus, ComplaintStatus[]> = {
      Open: ['In progress'],
      'In progress': ['Resolved'],
      Resolved: ['Closed'],
      Closed: [],
    };
    if (!allowedTransitions[complaint.status].includes(input.status)) {
      throw new Error(`The status cannot move from ${complaint.status} to ${input.status}.`);
    }
    complaint.status = input.status;
    complaint.assignedTo = input.assignedTo.trim() || undefined;
    const event: ComplaintEvent = {
      id: `${complaint.id}-EV-${complaint.events.length + 1}`,
      status: input.status,
      note: input.note.trim(),
      actor: user.name,
      createdAt: new Date().toISOString(),
    };
    complaint.events = [...complaint.events, event];
    publish();
    return copyComplaint(complaint);
  },
};
