export type UserRole = 'superadmin' | 'admin' | 'member' | 'staff';

export type MemberType = 'Owner' | 'Tenant';

export type SocietyStatus = 'Active' | 'Trial' | 'Inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  avatar?: string | null;
  societyId?: string;
  societyName?: string;
  designation?: string;
  staffType?: string;
  gate?: string;
  wing?: string;
  flat?: string;
  memberType?: MemberType;
  familyMembers?: number;
  ownerName?: string;
  committeeMember?: boolean;
  societiesManaged?: number;
}

export interface Society {
  id: string;
  name: string;
  regNo: string;
  regDate: string;
  address: string;
  state: string;
  country: string;
  pincode: string;
  contact: string;
  email: string;
  website?: string;
  pan?: string;
  gst?: string;
  tan?: string;
  ptrc?: string;
  ptec?: string;
  adminUserId: string;
  subscriptionPlan: string;
  status: SocietyStatus;
  financialYearStart: string;
  wings: string[];
  totalFlats: number;
  interestRate: string;
  typeOfInterest: 'Simple' | 'Compound';
  billingCycle: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';
  openingDate: string;
}

export interface Member {
  id: string;
  societyId: string;
  name: string;
  printName?: string;
  underGroup?: string;
  maintainBillByBill?: boolean;
  activateInterest?: boolean;
  wing: string;
  floor?: number;
  unitNo: string;
  memberRegNo?: string;
  admissionDate?: string;
  entranceFeeDate?: string;
  occupancy?: 'Owner Occupied' | 'Tenant' | 'Vacant';
  memberType?: MemberType;
  areaSqFt?: number;
  positionIndex?: number;
  memberClass?: string;
  occupation?: string;
  ageOnAdmission?: number;
  mailingAddress?: string;
  contactName?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  country?: string;
  state?: string;
  gstin?: string | null;
  nomineeName?: string;
  nomineeAddress?: string;
  dateOfNomination?: string;
  enteredInMCMDate?: string;
  openingBalance: number;
  isActive: boolean;
}
