import { mockMembers } from '../data/mockMembers';
import type { User } from '../types/models';

export type BillStatus = 'Paid' | 'Partially paid' | 'Pending' | 'Overdue';

export interface SocietyBill {
  id: string;
  societyId: string;
  memberId: string;
  flat: string;
  member: string;
  period: string;
  issuedOn: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: BillStatus;
  chargeHeads: string[];
}

export interface MockReceipt {
  id: string;
  billId: string;
  societyId: string;
  memberId: string;
  amount: number;
  paidOn: string;
  method: 'Demo payment';
}

interface GenerateBillsInput {
  period: string;
  dueDate: string;
  chargeHeads: string[];
}

const chargeHeadRates: Record<string, { label: string; rate: number; basis: 'area' | 'flat' }> = {
  maintenance: { label: 'General maintenance', rate: 6.5, basis: 'area' },
  water: { label: 'Water charges', rate: 650, basis: 'flat' },
  sinking: { label: 'Sinking fund', rate: 1.25, basis: 'area' },
};

const initialBills: SocietyBill[] = [
  { id: 'BILL-SOC001-202610-MB001', societyId: 'SOC001', memberId: 'MB001', flat: 'A-1204', member: 'Anjali Mehta', period: '2026-10', issuedOn: '2026-10-01', dueDate: '2026-11-10', amount: 12400, paidAmount: 0, status: 'Pending', chargeHeads: ['maintenance', 'water', 'sinking'] },
  { id: 'BILL-SOC001-202610-MB002', societyId: 'SOC001', memberId: 'MB002', flat: 'B-504', member: 'Rohit Sharma', period: '2026-10', issuedOn: '2026-10-01', dueDate: '2026-11-10', amount: 9800, paidAmount: 0, status: 'Pending', chargeHeads: ['maintenance', 'water', 'sinking'] },
  { id: 'BILL-SOC001-202610-MB003', societyId: 'SOC001', memberId: 'MB003', flat: 'C-301', member: 'Meera Iyer', period: '2026-10', issuedOn: '2026-10-01', dueDate: '2026-10-10', amount: 11250, paidAmount: 0, status: 'Overdue', chargeHeads: ['maintenance', 'water', 'sinking'] },
  { id: 'BILL-SOC001-202610-MB004', societyId: 'SOC001', memberId: 'MB004', flat: 'A-802', member: 'Karan Shah', period: '2026-10', issuedOn: '2026-10-01', dueDate: '2026-10-10', amount: 10400, paidAmount: 10400, status: 'Paid', chargeHeads: ['maintenance', 'water', 'sinking'] },
  { id: 'BILL-SOC001-202610-MB005', societyId: 'SOC001', memberId: 'MB005', flat: 'B-903', member: 'Fatima Khan', period: '2026-10', issuedOn: '2026-10-01', dueDate: '2026-11-10', amount: 10650, paidAmount: 4500, status: 'Partially paid', chargeHeads: ['maintenance', 'water', 'sinking'] },
  { id: 'BILL-SOC001-202610-MB006', societyId: 'SOC001', memberId: 'MB006', flat: 'C-604', member: 'Devendra Joshi', period: '2026-10', issuedOn: '2026-10-01', dueDate: '2026-10-10', amount: 13800, paidAmount: 0, status: 'Overdue', chargeHeads: ['maintenance', 'water', 'sinking'] },
];

let bills = initialBills.map((bill) => ({ ...bill, chargeHeads: [...bill.chargeHeads] }));
let receipts: MockReceipt[] = [
  { id: 'RCT-SOC001-0001', billId: 'BILL-SOC001-202610-MB004', societyId: 'SOC001', memberId: 'MB004', amount: 10400, paidOn: '2026-10-06', method: 'Demo payment' },
];
let revision = 0;
const listeners = new Set<() => void>();

function assertSocietyUser(user: User, roles: User['role'][]): string {
  if (!roles.includes(user.role) || !user.societyId) {
    throw new Error('You do not have permission to access society billing records.');
  }
  return user.societyId;
}

function getStatus(bill: SocietyBill): BillStatus {
  if (bill.paidAmount >= bill.amount) return 'Paid';
  if (bill.paidAmount > 0) return 'Partially paid';
  if (bill.dueDate < new Date().toISOString().slice(0, 10)) return 'Overdue';
  return 'Pending';
}

function publish() {
  revision += 1;
  listeners.forEach((listener) => listener());
}

function calculateAmount(memberId: string, selectedHeads: string[]): number {
  const member = mockMembers.find((item) => item.id === memberId);
  if (!member) throw new Error('The selected flat is not available for billing.');
  return selectedHeads.reduce((total, headId) => {
    const head = chargeHeadRates[headId];
    if (!head) throw new Error(`Unknown charge head: ${headId}`);
    const amount = head.basis === 'area' ? (member.areaSqFt ?? 0) * head.rate : head.rate;
    return total + amount;
  }, 0);
}

export const billingService = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getRevision() {
    return revision;
  },
  reset() {
    bills = initialBills.map((bill) => ({ ...bill, chargeHeads: [...bill.chargeHeads] }));
    receipts = [
      { id: 'RCT-SOC001-0001', billId: 'BILL-SOC001-202610-MB004', societyId: 'SOC001', memberId: 'MB004', amount: 10400, paidOn: '2026-10-06', method: 'Demo payment' },
    ];
    publish();
  },
  getChargeHeads() {
    return Object.entries(chargeHeadRates).map(([id, head]) => ({ id, label: head.label }));
  },
  getBillsForUser(user: User): SocietyBill[] {
    const societyId = assertSocietyUser(user, ['admin', 'member']);
    const scopedBills = bills.filter((bill) => bill.societyId === societyId);
    return (user.role === 'member' ? scopedBills.filter((bill) => bill.memberId === user.id) : scopedBills)
      .map((bill) => ({ ...bill, status: getStatus(bill), chargeHeads: [...bill.chargeHeads] }));
  },
  previewBills(user: User, input: GenerateBillsInput) {
    const societyId = assertSocietyUser(user, ['admin']);
    if (!/^\d{4}-\d{2}$/.test(input.period) || !/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate)) {
      throw new Error('Choose a valid billing period and due date.');
    }
    if (input.chargeHeads.length === 0 || input.chargeHeads.some((head) => !chargeHeadRates[head])) {
      throw new Error('Select at least one valid charge head.');
    }
    const eligibleMembers = mockMembers.filter((member) => member.societyId === societyId && member.isActive);
    const existing = new Set(bills.filter((bill) => bill.societyId === societyId && bill.period === input.period).map((bill) => bill.memberId));
    const duplicates = eligibleMembers.filter((member) => existing.has(member.id));
    if (duplicates.length > 0) {
      throw new Error(`Bills already exist for ${duplicates.map((member) => `${member.wing}-${member.unitNo}`).join(', ')} in this period.`);
    }
    return eligibleMembers.map((member) => ({
      memberId: member.id,
      flat: `${member.wing}-${member.unitNo}`,
      member: member.name,
      amount: Math.round(calculateAmount(member.id, input.chargeHeads)),
    }));
  },
  generateBills(user: User, input: GenerateBillsInput): SocietyBill[] {
    const societyId = assertSocietyUser(user, ['admin']);
    const preview = this.previewBills(user, input);
    const periodKey = input.period.replace('-', '');
    const issuedOn = new Date().toISOString().slice(0, 10);
    const generated = preview.map((item) => ({
      id: `BILL-${societyId}-${periodKey}-${item.memberId}`,
      societyId,
      memberId: item.memberId,
      flat: item.flat,
      member: item.member,
      period: input.period,
      issuedOn,
      dueDate: input.dueDate,
      amount: item.amount,
      paidAmount: 0,
      status: 'Pending' as const,
      chargeHeads: [...input.chargeHeads],
    }));
    bills = [...generated, ...bills];
    publish();
    return generated.map((bill) => ({ ...bill, chargeHeads: [...bill.chargeHeads] }));
  },
  recordDemoPayment(user: User, billId: string): { bill: SocietyBill; receipt: MockReceipt } {
    const societyId = assertSocietyUser(user, ['member']);
    const bill = bills.find((item) => item.id === billId && item.societyId === societyId && item.memberId === user.id);
    if (!bill) throw new Error('This bill is not available in your account.');
    if (getStatus(bill) === 'Paid') throw new Error('This bill has already been paid.');
    const paidAmount = bill.amount - bill.paidAmount;
    bill.paidAmount = bill.amount;
    bill.status = 'Paid';
    const receipt: MockReceipt = {
      id: `RCT-${societyId}-${String(receipts.length + 1).padStart(4, '0')}`,
      billId: bill.id,
      societyId,
      memberId: user.id,
      amount: paidAmount,
      paidOn: new Date().toISOString().slice(0, 10),
      method: 'Demo payment',
    };
    receipts = [...receipts, receipt];
    publish();
    return { bill: { ...bill, chargeHeads: [...bill.chargeHeads] }, receipt: { ...receipt } };
  },
  getReceipt(user: User, billId: string): MockReceipt | undefined {
    const societyId = assertSocietyUser(user, ['admin', 'member']);
    const bill = bills.find((item) => item.id === billId && item.societyId === societyId);
    if (!bill || (user.role === 'member' && bill.memberId !== user.id)) {
      throw new Error('This receipt is not available in your account.');
    }
    const receipt = receipts.find((item) => item.billId === billId);
    return receipt ? { ...receipt } : undefined;
  },
};
