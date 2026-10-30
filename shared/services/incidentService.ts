import type { User } from '../types/models';
import { taskService } from './taskService';

export interface SocietyIncident {
  id: string;
  societyId: string;
  reporterId: string;
  reporterName: string;
  type: string;
  location: string;
  description: string;
  createdAt: string;
  followUpTaskId?: string;
}

let incidents: SocietyIncident[] = [];
let sequence = 1;
let revision = 0;
const listeners = new Set<() => void>();

function assertStaff(user: User) {
  if (user.role !== 'staff' || !user.societyId) throw new Error('Only society staff can submit an incident report.');
  return user.societyId;
}

function publish() {
  revision += 1;
  listeners.forEach((listener) => listener());
}

export const incidentService = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getRevision() {
    return revision;
  },
  reset() {
    incidents = [];
    sequence = 1;
    publish();
  },
  create(user: User, input: { type: string; location: string; description: string }): SocietyIncident {
    const societyId = assertStaff(user);
    if (!input.type.trim() || !input.location.trim() || input.description.trim().length < 8) {
      throw new Error('Enter an incident type, location and at least 8 characters of detail.');
    }
    const id = `INC-${String(sequence++).padStart(4, '0')}`;
    const task = taskService.createIncidentFollowUp(user, {
      title: `Incident follow-up: ${input.type.trim()}`,
      location: input.location.trim(),
      description: input.description.trim(),
    });
    const incident: SocietyIncident = {
      id, societyId, reporterId: user.id, reporterName: user.name, type: input.type.trim(),
      location: input.location.trim(), description: input.description.trim(), createdAt: new Date().toISOString(),
      followUpTaskId: task.id,
    };
    incidents = [incident, ...incidents];
    publish();
    return { ...incident };
  },
  getVisible(user: User): SocietyIncident[] {
    if (!user.societyId) throw new Error('A society scope is required.');
    if (user.role === 'admin' || (user.role === 'staff' && (user.staffType === 'Manager' || user.staffType === 'Chairman'))) {
      return incidents.filter((incident) => incident.societyId === user.societyId).map((incident) => ({ ...incident }));
    }
    if (user.role === 'staff') {
      return incidents.filter((incident) => incident.societyId === user.societyId && incident.reporterId === user.id).map((incident) => ({ ...incident }));
    }
    throw new Error('You do not have permission to access incident reports.');
  },
};
