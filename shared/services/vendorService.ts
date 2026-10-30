import type { User } from '../types/models';
import { taskService } from './taskService';

export interface VendorContract {
  id: string;
  societyId: string;
  vendor: string;
  service: string;
  contact: string;
  contractEnd: string;
  workOrderTaskId?: string;
}
let contracts: VendorContract[] = [
  { id: 'AMC-201', societyId: 'SOC001', vendor: 'LiftCare Services', service: 'Elevator maintenance', contact: 'society-office@example.in', contractEnd: '2026-11-15' },
  { id: 'AMC-202', societyId: 'SOC001', vendor: 'AquaCare Services', service: 'Water pump AMC', contact: 'society-office@example.in', contractEnd: '2027-03-31' },
];
let next = 1;
let failNext = false;
function mayFail() { if (failNext) { failNext = false; throw new Error('Vendor demo service is temporarily unavailable.'); } }
function scope(user: User): string {
  if (!user.societyId || !(user.role === 'admin' || (user.role === 'staff' && user.staffType === 'Manager'))) throw new Error('Only a society admin or manager can access vendor contracts.');
  return user.societyId;
}
export const vendorService = {
  injectFailure() { failNext = true; },
  reset() { contracts = contracts.filter((item) => item.societyId === 'SOC001').map((item) => ({ ...item, workOrderTaskId: undefined })); next = 1; failNext = false; },
  getAll(user: User): VendorContract[] { mayFail(); const societyId = scope(user); return contracts.filter((item) => item.societyId === societyId).map((item) => ({ ...item })); },
  createWorkOrder(user: User, id: string): VendorContract {
    mayFail();
    const societyId = scope(user);
    const contract = contracts.find((item) => item.id === id && item.societyId === societyId);
    if (!contract) throw new Error('Vendor contract was not found.');
    const task = taskService.createFollowUp(user, { title: `AMC work order: ${contract.vendor}`, description: `${contract.service} service visit.`, location: 'Society premises' });
    contract.workOrderTaskId = task.id;
    return { ...contract };
  },
};
