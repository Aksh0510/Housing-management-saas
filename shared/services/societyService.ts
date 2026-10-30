import { addDemoUser } from './authService';
import { mockSocieties } from '../data/mockSocieties';
import type { Society, User } from '../types/models';

interface CreateSocietyInput {
  name: string;
  registrationNo: string;
  city: string;
  pincode: string;
  pan: string;
  gstin: string;
  tan: string;
  adminName: string;
  adminEmail: string;
  mobile: string;
  plan: string;
  financialYearStart: string;
  billingCycle: Society['billingCycle'];
  interestRate: string;
}

let societies = mockSocieties.map((society) => ({ ...society, wings: [...society.wings] }));
let nextSocietyNumber = 1;
let nextAdminNumber = 1;

export const societyService = {
  getAll(): Society[] {
    return societies.map((society) => ({ ...society, wings: [...society.wings] }));
  },
  create(input: CreateSocietyInput): { society: Society; admin: User } {
    if (!input.name.trim() || !input.registrationNo.trim() || !input.adminName.trim()) {
      throw new Error('Society name, registration number and administrator name are required.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.adminEmail.trim())) {
      throw new Error('Enter a valid administrator email address.');
    }
    if (!/^[0-9]{6}$/.test(input.pincode.trim()) || !/^\+?[0-9\s-]{10,16}$/.test(input.mobile.trim())) {
      throw new Error('Enter a six-digit pincode and a valid contact number.');
    }
    if (societies.some((society) => society.name.toLocaleLowerCase() === input.name.trim().toLocaleLowerCase() || society.regNo.toLocaleLowerCase() === input.registrationNo.trim().toLocaleLowerCase())) {
      throw new Error('A society with this name or registration number already exists.');
    }
    const societyId = `SOC-DEMO-${String(nextSocietyNumber).padStart(3, '0')}`;
    const adminId = `AD-DEMO-${String(nextAdminNumber).padStart(3, '0')}`;
    const society: Society = {
      id: societyId,
      name: input.name.trim(),
      regNo: input.registrationNo.trim(),
      regDate: new Date().toISOString().slice(0, 10),
      address: input.city.trim(),
      state: 'Maharashtra',
      country: 'India',
      pincode: input.pincode.trim(),
      contact: input.mobile.trim(),
      email: input.adminEmail.trim(),
      pan: input.pan.trim() || undefined,
      gst: input.gstin.trim() || undefined,
      tan: input.tan.trim() || undefined,
      adminUserId: adminId,
      subscriptionPlan: input.plan,
      status: 'Trial',
      financialYearStart: input.financialYearStart,
      wings: ['A'],
      totalFlats: 0,
      interestRate: input.interestRate,
      typeOfInterest: 'Simple',
      billingCycle: input.billingCycle,
      openingDate: input.financialYearStart,
    };
    const admin: User = {
      id: adminId,
      name: input.adminName.trim(),
      email: input.adminEmail.trim(),
      mobile: input.mobile.trim(),
      role: 'admin',
      societyId,
      societyName: society.name,
      designation: 'Society Admin',
    };
    const registeredAdmin = addDemoUser(admin);
    societies = [{ ...society, wings: [...society.wings] }, ...societies];
    nextSocietyNumber += 1;
    nextAdminNumber += 1;
    return { society: { ...society, wings: [...society.wings] }, admin: registeredAdmin };
  },
  reset() {
    societies = mockSocieties.map((society) => ({ ...society, wings: [...society.wings] }));
    nextSocietyNumber = 1;
    nextAdminNumber = 1;
  },
};
