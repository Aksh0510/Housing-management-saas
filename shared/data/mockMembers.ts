import type { Member } from '../types/models';

export const mockMembers: Member[] = [
  {
    id: 'MB001', societyId: 'SOC001', name: 'Anjali Mehta', printName: 'Anjali R. Mehta',
    underGroup: 'Sundry Debtors', maintainBillByBill: true, activateInterest: true,
    wing: 'A', floor: 12, unitNo: '1204', memberRegNo: 'A-1204-001',
    admissionDate: '2020-08-01', entranceFeeDate: '2020-08-01', occupancy: 'Owner Occupied',
    memberType: 'Owner', areaSqFt: 1250, positionIndex: 1204, memberClass: 'Class A',
    occupation: 'Architect', ageOnAdmission: 38,
    mailingAddress: 'A-1204, Shree Ganesh CHS, Prabhadevi, Mumbai 400025',
    contactName: 'Anjali Mehta', phone: '+91-22-24301234', mobile: '+91-9000000005',
    email: 'anjali@gmail.com', country: 'India', state: 'Maharashtra', gstin: null,
    nomineeName: 'Rakesh Mehta', nomineeAddress: 'Same as above',
    dateOfNomination: '2020-08-01', enteredInMCMDate: '2020-08-10',
    openingBalance: 12400, isActive: true,
  },
  {
    id: 'MB002', societyId: 'SOC001', name: 'Rohit Sharma', wing: 'B', floor: 5,
    unitNo: '504', memberRegNo: 'B-504-002', admissionDate: '2022-01-15',
    occupancy: 'Tenant', memberType: 'Tenant', areaSqFt: 950, memberClass: 'Class B',
    occupation: 'Software Engineer', mobile: '+91-9000000006', email: 'rohit@gmail.com',
    nomineeName: 'Priya Sharma', openingBalance: 0, isActive: true,
  },
  {
    id: 'MB003', societyId: 'SOC001', name: 'Meera Iyer', printName: 'Meera S. Iyer',
    wing: 'C', floor: 3, unitNo: '301', memberRegNo: 'C-301-003', admissionDate: '2019-11-20',
    occupancy: 'Owner Occupied', memberType: 'Owner', areaSqFt: 1100, memberClass: 'Class A',
    occupation: 'Consultant', mobile: '+91-9000000007', email: 'meera@gmail.com',
    openingBalance: 8250, isActive: true,
  },
  {
    id: 'MB004', societyId: 'SOC001', name: 'Karan Shah', wing: 'A', floor: 8,
    unitNo: '802', memberRegNo: 'A-802-004', admissionDate: '2021-05-01',
    occupancy: 'Owner Occupied', memberType: 'Owner', areaSqFt: 980,
    occupation: 'Chartered Accountant', mobile: '+91-9000000011', email: 'karan@example.in',
    openingBalance: 3200, isActive: true,
  },
  {
    id: 'MB005', societyId: 'SOC001', name: 'Fatima Khan', wing: 'B', floor: 9,
    unitNo: '903', memberRegNo: 'B-903-005', admissionDate: '2023-02-14',
    occupancy: 'Tenant', memberType: 'Tenant', areaSqFt: 1020,
    occupation: 'Designer', mobile: '+91-9000000012', email: 'fatima@example.in',
    openingBalance: 0, isActive: true,
  },
  {
    id: 'MB006', societyId: 'SOC001', name: 'Devendra Joshi', wing: 'C', floor: 6,
    unitNo: '604', memberRegNo: 'C-604-006', admissionDate: '2018-07-01',
    occupancy: 'Owner Occupied', memberType: 'Owner', areaSqFt: 1375,
    occupation: 'Business Owner', mobile: '+91-9000000013', email: 'devendra@example.in',
    openingBalance: 18750, isActive: true,
  },
];
