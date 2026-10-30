import type { User } from '../types/models';
import { auditService } from './auditService';

export interface NocRequest {
  id: string;
  societyId: string;
  residentId: string;
  residentName: string;
  flat: string;
  purpose: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  decisionReason?: string;
  createdAt: string;
}

let requests: NocRequest[] = [];
let next = 1;
let failNext = false;
function mayFail() { if (failNext) { failNext = false; throw new Error('Documents demo service is temporarily unavailable.'); } }
function scope(user: User, roles: User['role'][]): string {
  if (!roles.includes(user.role) || !user.societyId) throw new Error('You do not have permission to access society documents.');
  return user.societyId;
}

export const documentService = {
  injectFailure() { failNext = true; },
  reset() { requests = []; next = 1; failNext = false; },
  getFolders(user: User) {
    mayFail(); scope(user, ['member', 'admin', 'superadmin']);
    return [{ name: 'Society bylaws', documents: 3 }, { name: 'Meeting minutes', documents: 8 }, { name: 'NOC requests', documents: requests.length }];
  },
  getRequests(user: User): NocRequest[] {
    mayFail();
    const societyId = scope(user, ['member', 'admin', 'superadmin']);
    return requests.filter((item) => item.societyId === societyId && (user.role !== 'member' || item.residentId === user.id)).map((item) => ({ ...item }));
  },
  request(user: User, purpose: string): NocRequest {
    mayFail();
    const societyId = scope(user, ['member']);
    if (purpose.trim().length < 5) throw new Error('Enter the NOC purpose (at least 5 characters).');
    const request: NocRequest = { id: `NOC-${String(next++).padStart(3, '0')}`, societyId, residentId: user.id, residentName: user.name, flat: `${user.wing ?? ''}-${user.flat ?? ''}`, purpose: purpose.trim(), status: 'Pending', createdAt: new Date().toISOString() };
    requests = [request, ...requests];
    return { ...request };
  },
  decide(user: User, id: string, decision: 'Approved' | 'Rejected', reason: string): NocRequest {
    mayFail();
    const societyId = scope(user, ['admin']);
    const request = requests.find((item) => item.id === id && item.societyId === societyId && item.status === 'Pending');
    if (!request) throw new Error('Pending NOC request was not found.');
    if (reason.trim().length < 3) throw new Error('Enter a decision reason of at least 3 characters.');
    auditService.record(user, { action: `NOC ${decision.toLowerCase()}`, entity: 'NOC request', entityId: request.id, before: JSON.stringify({ status: request.status }), after: JSON.stringify({ status: decision, reason: reason.trim() }) });
    request.status = decision;
    request.decisionReason = reason.trim();
    return { ...request };
  },
};
