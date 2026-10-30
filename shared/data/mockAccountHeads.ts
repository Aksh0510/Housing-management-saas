export interface AccountHead {
  id: string;
  srNo: number;
  acHead: string;
  group: string;
  remarks: string;
  type: 'Income' | 'Expense';
}

export const mockIncomeHeads: AccountHead[] = [
  { id: 'IH01', srNo: 1, acHead: 'Property Tax for Common Area', group: 'Direct Incomes', remarks: '', type: 'Income' },
  { id: 'IH02', srNo: 2, acHead: 'Water Charges', group: 'Direct Incomes', remarks: '', type: 'Income' },
  { id: 'IH03', srNo: 3, acHead: 'General Maintenance Charges', group: 'Direct Incomes', remarks: '', type: 'Income' },
  { id: 'IH04', srNo: 4, acHead: 'Insurance Charges - Building', group: 'Direct Incomes', remarks: '', type: 'Income' },
  { id: 'IH05', srNo: 5, acHead: 'Sinking Fund @ 0.250% on Construction Cost', group: 'Direct Incomes', remarks: 'Statutory', type: 'Income' },
  { id: 'IH06', srNo: 6, acHead: 'Repair Fund @ 0.750% on Construction Cost', group: 'Direct Incomes', remarks: 'Statutory', type: 'Income' },
  { id: 'IH07', srNo: 7, acHead: 'Four Wheeler Parking', group: 'Direct Incomes', remarks: '', type: 'Income' },
  { id: 'IH08', srNo: 8, acHead: 'Non Occupancy Charges', group: 'Direct Incomes', remarks: 'For tenanted flats', type: 'Income' },
  { id: 'IH09', srNo: 9, acHead: 'Late Payment Charges', group: 'Direct Incomes', remarks: '12% P.A.', type: 'Income' },
  { id: 'IH10', srNo: 10, acHead: 'Other Charges', group: 'Direct Incomes', remarks: '', type: 'Income' },
];

export const mockExpenseHeads: AccountHead[] = [
  { id: 'EH01', srNo: 1, acHead: 'Security Guard Salary', group: 'Indirect Expenses', remarks: '', type: 'Expense' },
  { id: 'EH02', srNo: 2, acHead: 'Housekeeping / Cleaning', group: 'Indirect Expenses', remarks: '', type: 'Expense' },
  { id: 'EH03', srNo: 3, acHead: 'Lift AMC', group: 'Indirect Expenses', remarks: '', type: 'Expense' },
  { id: 'EH04', srNo: 4, acHead: 'Water Tank Cleaning', group: 'Indirect Expenses', remarks: '', type: 'Expense' },
  { id: 'EH05', srNo: 5, acHead: 'Garden Maintenance', group: 'Indirect Expenses', remarks: '', type: 'Expense' },
  { id: 'EH06', srNo: 6, acHead: 'Electricity - Common Area', group: 'Direct Expenses', remarks: '', type: 'Expense' },
  { id: 'EH07', srNo: 7, acHead: 'Repairs & Maintenance', group: 'Direct Expenses', remarks: '', type: 'Expense' },
  { id: 'EH08', srNo: 8, acHead: 'Property Tax', group: 'Direct Expenses', remarks: '', type: 'Expense' },
  { id: 'EH09', srNo: 9, acHead: 'Audit Fees', group: 'Indirect Expenses', remarks: '', type: 'Expense' },
  { id: 'EH10', srNo: 10, acHead: 'Insurance Premium', group: 'Direct Expenses', remarks: '', type: 'Expense' },
];

export const mockAccountHeads = [...mockIncomeHeads, ...mockExpenseHeads];
