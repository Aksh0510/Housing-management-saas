import type { User } from '../types/models';
import { auditService } from './auditService';

export type AmenityBookingStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
export interface AmenityBooking {
  id: string;
  societyId: string;
  residentId: string;
  residentName: string;
  flat: string;
  amenity: string;
  date: string;
  start: string;
  end: string;
  charge: number;
  status: AmenityBookingStatus;
  decisionReason?: string;
}

export const amenityConfig = [
  { name: 'Community Hall', charge: 1500, open: '08:00', close: '22:00' },
  { name: 'Badminton Court', charge: 250, open: '06:00', close: '21:00' },
];
let bookings: AmenityBooking[] = [
  { id: 'AMN-101', societyId: 'SOC001', residentId: 'MB001', residentName: 'Anjali Mehta', flat: 'A-1204', amenity: 'Community Hall', date: '2026-11-07', start: '18:00', end: '20:00', charge: 1500, status: 'Approved' },
];
let next = 102;
let failNext = false;
function mayFail() { if (failNext) { failNext = false; throw new Error('Amenity demo service is temporarily unavailable.'); } }
function assertScope(user: User, roles: User['role'][]): string {
  if (!roles.includes(user.role) || !user.societyId) throw new Error('You do not have permission to access amenity bookings.');
  return user.societyId;
}
export const amenityService = {
  injectFailure() { failNext = true; },
  reset() { bookings = bookings.filter((item) => item.id === 'AMN-101').map((item) => ({ ...item })); next = 102; failNext = false; },
  getConfig() { return amenityConfig.map((item) => ({ ...item })); },
  getForUser(user: User): AmenityBooking[] {
    mayFail();
    const societyId = assertScope(user, ['member', 'admin']);
    return bookings.filter((item) => item.societyId === societyId && (user.role === 'admin' || item.residentId === user.id)).map((item) => ({ ...item }));
  },
  request(user: User, input: { amenity: string; date: string; start: string; end: string }): AmenityBooking {
    mayFail();
    const societyId = assertScope(user, ['member']);
    const config = amenityConfig.find((item) => item.name === input.amenity);
    if (!config || !input.date || !input.start || !input.end || input.end <= input.start || input.start < config.open || input.end > config.close) throw new Error('Choose an amenity and a valid time within its opening hours.');
    const overlap = bookings.some((item) => item.societyId === societyId && item.amenity === input.amenity && item.date === input.date && ['Pending', 'Approved'].includes(item.status) && input.start < item.end && input.end > item.start);
    if (overlap) throw new Error('That amenity slot overlaps an existing or pending booking.');
    const booking: AmenityBooking = { id: `AMN-${next++}`, societyId, residentId: user.id, residentName: user.name, flat: `${user.wing ?? ''}-${user.flat ?? ''}`, ...input, charge: config.charge, status: 'Pending' };
    bookings = [booking, ...bookings];
    return { ...booking };
  },
  decide(user: User, id: string, decision: 'Approved' | 'Rejected', reason = ''): AmenityBooking {
    mayFail();
    const societyId = assertScope(user, ['admin']);
    const booking = bookings.find((item) => item.id === id && item.societyId === societyId);
    if (!booking || booking.status !== 'Pending') throw new Error('Pending amenity request was not found.');
    if (decision === 'Approved' && bookings.some((item) => item.id !== id && item.societyId === societyId && item.amenity === booking.amenity && item.date === booking.date && item.status === 'Approved' && booking.start < item.end && booking.end > item.start)) throw new Error('Another approved booking conflicts with this slot.');
    if (decision === 'Rejected' && reason.trim().length < 3) throw new Error('Add a short reason when rejecting a booking.');
    auditService.record(user, { action: `Amenity booking ${decision.toLowerCase()}`, entity: 'Amenity booking', entityId: booking.id, before: JSON.stringify({ status: booking.status }), after: JSON.stringify({ status: decision, reason: reason.trim() }) });
    booking.status = decision;
    booking.decisionReason = reason.trim() || undefined;
    return { ...booking };
  },
  cancel(user: User, id: string): AmenityBooking {
    mayFail();
    const societyId = assertScope(user, ['member']);
    const booking = bookings.find((item) => item.id === id && item.societyId === societyId && item.residentId === user.id);
    if (!booking || !['Pending', 'Approved'].includes(booking.status)) throw new Error('This booking cannot be cancelled.');
    booking.status = 'Cancelled';
    return { ...booking };
  },
};
