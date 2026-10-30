import type { User } from '../types/models';
import { auditService } from './auditService';

export type ParkingRequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Revoked';
export interface VehicleRecord {
  id: string;
  societyId: string;
  residentId: string;
  flat: string;
  plate: string;
  type: string;
  slot?: string;
  status: ParkingRequestStatus;
  history: { action: string; at: string; actor: string }[];
}

let vehicles: VehicleRecord[] = [
  { id: 'VEH-301', societyId: 'SOC001', residentId: 'MB001', flat: 'A-1204', plate: 'MH 02 AB 1234', type: 'Car', slot: 'P-12', status: 'Approved', history: [{ action: 'Slot P-12 allocated', at: '2026-09-10T10:00:00Z', actor: 'Society office' }] },
];
let next = 302;
let failNext = false;

function mayFail() {
  if (failNext) {
    failNext = false;
    throw new Error('Parking demo service is temporarily unavailable.');
  }
}
function assertScope(user: User, roles: User['role'][]): string {
  if (!roles.includes(user.role) || !user.societyId) throw new Error('You do not have permission to access parking records.');
  return user.societyId;
}
function copy(item: VehicleRecord): VehicleRecord { return { ...item, history: item.history.map((event) => ({ ...event })) }; }

export const parkingService = {
  injectFailure() { failNext = true; },
  reset() { vehicles = vehicles.filter((item) => item.id === 'VEH-301').map(copy); next = 302; failNext = false; },
  getForUser(user: User): VehicleRecord[] {
    mayFail();
    const societyId = assertScope(user, ['member', 'admin', 'staff']);
    return vehicles.filter((item) => item.societyId === societyId && (user.role !== 'member' || item.residentId === user.id)).map(copy);
  },
  request(user: User, input: { plate: string; type: string }): VehicleRecord {
    mayFail();
    const societyId = assertScope(user, ['member']);
    const plate = input.plate.trim().toUpperCase().replace(/\s+/g, ' ');
    if (!/^[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,3}\s?\d{1,4}$/.test(plate)) throw new Error('Enter a valid vehicle registration number.');
    if (vehicles.some((item) => item.societyId === societyId && item.plate === plate && item.status !== 'Rejected' && item.status !== 'Revoked')) throw new Error('This vehicle is already registered or awaiting approval.');
    if (!input.type.trim()) throw new Error('Choose a vehicle type.');
    const item: VehicleRecord = { id: `VEH-${next++}`, societyId, residentId: user.id, flat: `${user.wing ?? ''}-${user.flat ?? ''}`, plate, type: input.type.trim(), status: 'Pending', history: [{ action: 'Parking request submitted', at: new Date().toISOString(), actor: user.name }] };
    vehicles = [item, ...vehicles];
    return copy(item);
  },
  decide(user: User, id: string, decision: 'Approved' | 'Rejected', slot = ''): VehicleRecord {
    mayFail();
    const societyId = assertScope(user, ['admin']);
    const item = vehicles.find((row) => row.id === id && row.societyId === societyId);
    if (!item || item.status !== 'Pending') throw new Error('Pending parking request was not found.');
    if (decision === 'Approved') {
      if (!slot.trim()) throw new Error('Enter an allocated parking slot.');
      if (vehicles.some((row) => row.societyId === societyId && row.id !== id && row.slot?.toUpperCase() === slot.trim().toUpperCase() && row.status === 'Approved')) throw new Error('This parking slot is already allocated.');
      item.slot = slot.trim().toUpperCase();
    }
    auditService.record(user, { action: `Parking ${decision.toLowerCase()}`, entity: 'Vehicle', entityId: item.id, before: JSON.stringify({ status: item.status, slot: item.slot ?? null }), after: JSON.stringify({ status: decision, slot: decision === 'Approved' ? item.slot : null }) });
    item.status = decision;
    item.history.push({ action: decision === 'Approved' ? `Slot ${item.slot} allocated` : 'Request rejected', at: new Date().toISOString(), actor: user.name });
    return copy(item);
  },
  revoke(user: User, id: string): VehicleRecord {
    mayFail();
    const societyId = assertScope(user, ['admin']);
    const item = vehicles.find((row) => row.id === id && row.societyId === societyId && row.status === 'Approved');
    if (!item) throw new Error('Approved parking allocation was not found.');
    auditService.record(user, { action: 'Parking allocation revoked', entity: 'Vehicle', entityId: item.id, before: JSON.stringify({ status: item.status, slot: item.slot }), after: JSON.stringify({ status: 'Revoked', slot: item.slot }) });
    item.status = 'Revoked';
    item.history.push({ action: `Slot ${item.slot} revoked`, at: new Date().toISOString(), actor: user.name });
    return copy(item);
  },
};
