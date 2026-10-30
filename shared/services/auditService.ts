import type { User } from '../types/models';

export interface AuditEvent {
  id: string;
  societyId: string;
  actorId: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  before: string;
  after: string;
  at: string;
}
let events: AuditEvent[] = [];
let next = 1;
function assertAdmin(user: User) {
  if (user.role !== 'admin' || !user.societyId) throw new Error('Audit log access is restricted to the society admin.');
  return user.societyId;
}
export const auditService = {
  reset() { events = []; next = 1; },
  record(user: User, input: Omit<AuditEvent, 'id' | 'societyId' | 'actorId' | 'actor' | 'at'>) {
    const societyId = assertAdmin(user);
    const event: AuditEvent = { id: `AUD-${String(next++).padStart(4, '0')}`, societyId, actorId: user.id, actor: user.name, at: new Date().toISOString(), ...input };
    events = [event, ...events];
    return { ...event };
  },
  getForAdmin(user: User): AuditEvent[] {
    const societyId = assertAdmin(user);
    return events.filter((event) => event.societyId === societyId).map((event) => ({ ...event }));
  },
};
